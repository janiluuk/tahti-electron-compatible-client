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
        ? 'Mock upload complete — item stored in local mock archive.'
        : 'Upload complete — transcode may still be PENDING.',
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
            Flow: <code>POST /api/uploads/prepare</code> → PUT to MinIO →{' '}
            <code>POST /api/uploads/complete</code>. Mock mode skips network and
            invents a READY item.
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
        </label>
        {message && (
          <p className="text-foreground-secondary text-sm">{message}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy || !file} onClick={() => void submit()}>
            {busy ? 'Uploading…' : 'Upload'}
          </Button>
          {itemId && (
            <>
              <Link to="/studio/archive/$id" params={{ id: itemId }}>
                <Button variant="secondary">Open metadata</Button>
              </Link>
              <Link to="/studio/archive/$id/editor" params={{ id: itemId }}>
                <Button variant="text">Open editor</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </StudioGate>
  );
}
