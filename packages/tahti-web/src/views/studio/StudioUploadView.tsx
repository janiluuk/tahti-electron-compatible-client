import { Link } from '@tanstack/react-router';
import { UploadIcon } from 'lucide-react';
import { useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import { uploadArchiveFile } from '../../api/studio';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

export function StudioUploadView() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);

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
    setMessage(
      result.meta.source === 'mock'
        ? 'Upload complete (demo).'
        : 'Upload complete — processing may take a minute.',
    );
  };

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <StudioNav current="/studio/upload" />
        <StudioPageHeader
          title="Upload"
          subtitle="Add a track to your Music archive. MP3, WAV, FLAC, or AIFF."
          action={
            <Link to="/sources">
              <Button size="sm" variant="secondary">
                Open Sources
              </Button>
            </Link>
          }
        />
        <StudioPanel
          title="Audio file"
          description="Choose a local file and give it an optional display title."
        >
          <div className="flex flex-col gap-4">
            <Input
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Optional — defaults to filename"
            />
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-semibold">Audio file</span>
              <input
                type="file"
                accept="audio/*,.flac,.wav,.mp3,.aiff"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="border-border bg-background rounded-lg border p-3 text-sm"
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
            <div className="flex flex-wrap gap-2">
              <Button disabled={busy || !file} onClick={() => void submit()}>
                <UploadIcon size={16} aria-hidden className="mr-1.5" />
                {busy ? 'Uploading…' : 'Upload'}
              </Button>
              {itemId && (
                <Link to="/studio/archive/$id" params={{ id: itemId }}>
                  <Button variant="secondary">Open in Music</Button>
                </Link>
              )}
            </div>
          </div>
        </StudioPanel>
        <p className="text-foreground-secondary text-xs">
          <Link to="/studio/archive" className="hover:underline">
            ← Back to Music
          </Link>
        </p>
      </div>
    </StudioGate>
  );
}
