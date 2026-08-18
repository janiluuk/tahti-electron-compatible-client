import { useEffect, useRef, useState } from 'react';

import { Badge, Button, Dialog, Input } from '@nuclearplayer/ui';

import {
  createAdminLanguage,
  fetchAdminLanguages,
  importAdminLanguageCsv,
  type AdminLanguage,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

export function AdminI18nView() {
  const [languages, setLanguages] = useState<AdminLanguage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [importTarget, setImportTarget] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reload = () => {
    setLoading(true);
    void fetchAdminLanguages().then((res) => {
      setLanguages(res.data);
      setLoading(false);
    });
  };

  useEffect(reload, []);

  const closeNew = () => {
    setNewOpen(false);
    setCode('');
    setName('');
    setBusy(false);
  };

  const triggerImport = (langCode: string) => {
    setImportTarget(langCode);
    fileInputRef.current?.click();
  };

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/i18n" />
        <StudioPageHeader
          title="Languages"
          subtitle="Add a language, then import a CSV translated from the English base."
          action={
            <Button size="sm" onClick={() => setNewOpen(true)}>
              New language
            </Button>
          }
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            const target = importTarget;
            if (!file || !target) {
              return;
            }
            setBusy(true);
            setMsg(null);
            void importAdminLanguageCsv(target, file).then((res) => {
              setBusy(false);
              setImportTarget(null);
              if (!res.ok) {
                setMsg(res.error);
                return;
              }
              setMsg(
                `Imported ${res.data.imported} rows` +
                  (res.data.skipped ? `, skipped ${res.data.skipped}.` : '.'),
              );
              reload();
            });
          }}
        />

        {msg && (
          <p className="text-foreground-secondary text-sm" role="status">
            {msg}
          </p>
        )}

        <StudioPanel>
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : (
            <ul className="divide-border divide-y">
              {languages.map((lang) => {
                const pct = lang.totalKeys
                  ? Math.round((lang.translatedKeys / lang.totalKeys) * 100)
                  : 0;
                return (
                  <li
                    key={lang.code}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{lang.name}</span>
                        <span className="text-foreground-secondary font-mono text-xs uppercase">
                          {lang.code}
                        </span>
                        {lang.isDefault && (
                          <Badge variant="pill" color="secondary">
                            Base
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="bg-background-secondary h-1.5 w-32 overflow-hidden rounded-full">
                          <div
                            className="bg-primary h-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-foreground-secondary text-xs">
                          {lang.translatedKeys}/{lang.totalKeys} ({pct}%)
                        </span>
                      </div>
                    </div>
                    {!lang.isDefault && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy}
                        onClick={() => triggerImport(lang.code)}
                      >
                        Import CSV
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </StudioPanel>

        <Dialog.Root isOpen={newOpen} onClose={closeNew}>
          <Dialog.Title>New language</Dialog.Title>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (busy) {
                return;
              }
              setBusy(true);
              void createAdminLanguage({
                code: code.trim().toLowerCase(),
                name: name.trim(),
              }).then((res) => {
                setBusy(false);
                if (!res.ok) {
                  setMsg(res.error);
                  return;
                }
                closeNew();
                reload();
              });
            }}
          >
            <div className="mt-4 flex flex-col gap-3">
              <Input
                label="Code (e.g. sv)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
              />
              <Input
                label="Name (e.g. Swedish)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Dialog.Actions>
              <Dialog.Close>Cancel</Dialog.Close>
              <Button
                type="submit"
                disabled={busy || !code.trim() || !name.trim()}
              >
                {busy ? 'Adding…' : 'Add language'}
              </Button>
            </Dialog.Actions>
          </form>
        </Dialog.Root>
      </div>
    </AdminGate>
  );
}
