import { Link } from '@tanstack/react-router';
import { UploadIcon } from 'lucide-react';
import { useState } from 'react';

import { Button, Dialog, Input } from '@nuclearplayer/ui';

import { uploadArchiveFile } from '../api/studio';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: (itemId: string) => void;
};

export function UploadTrackDialog({ isOpen, onClose, onUploaded }: Props) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);

  const reset = () => {
    setTitle('');
    setFile(null);
    setBusy(false);
    setMessage(null);
    setItemId(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    if (!file) {
      setMessage('Choose an audio file.');
      return;
    }
    setBusy(true);
    setMessage(null);
    const result = await uploadArchiveFile({ file, title: title || file.name });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setItemId(result.itemId);
    onUploaded?.(result.itemId);
    setMessage(
      result.meta.source === 'mock'
        ? 'Upload complete (demo).'
        : 'Upload complete — processing may take a minute.',
    );
  };

  return (
    <Dialog.Root isOpen={isOpen} onClose={handleClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Dialog.Title>
          <span className="inline-flex items-center gap-2">
            <UploadIcon size={18} aria-hidden />
            Upload track
          </span>
        </Dialog.Title>
        <Dialog.Description>
          Add audio to your Music archive. MP3, WAV, FLAC, or AIFF.
        </Dialog.Description>
        <div className="mt-4 flex flex-col gap-3">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Optional — defaults to filename"
            autoFocus
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground-secondary text-xs uppercase">
              Audio file
            </span>
            <input
              type="file"
              accept="audio/*,.flac,.wav,.mp3,.aiff"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
            {file && (
              <span className="text-foreground-secondary text-xs">
                {file.name}
              </span>
            )}
          </label>
          {message && (
            <p className="text-foreground-secondary text-sm">{message}</p>
          )}
          {itemId && (
            <Link
              to="/studio/archive/$id"
              params={{ id: itemId }}
              className="text-sm underline"
              onClick={handleClose}
            >
              Open in Music
            </Link>
          )}
        </div>
        <Dialog.Actions>
          <Dialog.Close>Cancel</Dialog.Close>
          <Button type="submit" disabled={busy || !file}>
            <UploadIcon size={16} aria-hidden className="mr-1.5" />
            {busy ? 'Uploading…' : 'Upload'}
          </Button>
        </Dialog.Actions>
      </form>
    </Dialog.Root>
  );
}
