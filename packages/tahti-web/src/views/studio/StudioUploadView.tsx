import { Link } from '@tanstack/react-router';
import { useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import { uploadArchiveFile } from '../../api/studio';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';

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
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Upload
          </h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            Add a track to your Music archive. MP3, WAV, FLAC, or AIFF.
          </p>
        </div>
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Optional — defaults to filename"
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
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy || !file} onClick={() => void submit()}>
            {busy ? 'Uploading…' : 'Upload'}
          </Button>
          {itemId && (
            <Link to="/studio/archive/$id" params={{ id: itemId }}>
              <Button variant="secondary">Open in Music</Button>
            </Link>
          )}
        </div>
        <p className="text-foreground-secondary text-xs">
          <Link to="/studio/archive" className="hover:underline">
            ← Back to Music
          </Link>
        </p>
      </div>
    </StudioGate>
  );
}
