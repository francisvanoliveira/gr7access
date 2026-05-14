import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth, useAccessRequests } from '@/hooks/use-auth';
import { AppLayout } from '@/components/AppLayout';
import { getHostTypeIcon, getHostTypeLabel, getHostAddressLabel, type Host, type Client, type HostType } from '@/lib/mock-data';
import { ArrowLeft, Eye, EyeOff, Copy, Lock, Check, Edit2, Clock, Plus, Trash2, StickyNote, Paperclip, X, Download } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Route = createFileRoute('/hosts/$hostId')({
  head: () => ({
    meta: [{ title: 'Host — GR7 Access' }],
  }),
  component: HostDetailPage,
});

function HostDetailPage() {
  const { hostId } = Route.useParams();
  const { user, canEdit, isN1 } = useAuth();
  const { addRequest } = useAccessRequests();
  const navigate = useNavigate();

  const [host, setHost] = useState<Host | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [requestSheet, setRequestSheet] = useState(false);
  const [justification, setJustification] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [attachment, setAttachment] = useState<{ name: string; dataUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editHostModal, setEditHostModal] = useState(false);
  const [editHostForm, setEditHostForm] = useState<{ name: string; type: HostType; ip: string; username: string; password?: string }>({
    name: '', type: 'server', ip: '', username: '', password: ''
  });

  const [editNoteModal, setEditNoteModal] = useState(false);
  const [editNoteForm, setEditNoteForm] = useState<{ id: string; title: string; text: string; attachmentName?: string; attachmentDataUrl?: string } | null>(null);

  useEffect(() => {
    fetchHost();
  }, [hostId]);

  const fetchHost = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/hosts/${hostId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHost({ ...data, id: String(data.id), clientId: String(data.client_id), notesList: data.notes_list });
        if (data.client) {
          setClient({ ...data.client, id: String(data.client.id) });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!host || !newNote.trim()) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/hosts/${host.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          title: newNoteTitle,
          text: newNote,
          attachmentName: attachment?.name,
          attachmentDataUrl: attachment?.dataUrl,
          authorName: user?.name
        })
      });
      if (response.ok) {
        await fetchHost();
        setNewNote('');
        setNewNoteTitle('');
        setAttachment(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateNote = async () => {
    if (!host || !editNoteForm || !editNoteForm.text.trim()) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/hosts/${host.id}/notes/${editNoteForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          title: editNoteForm.title,
          text: editNoteForm.text,
          attachmentName: editNoteForm.attachmentName,
          attachmentDataUrl: editNoteForm.attachmentDataUrl,
        })
      });
      if (response.ok) {
        await fetchHost();
        setEditNoteModal(false);
        setEditNoteForm(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!host || !confirm('Tem certeza que deseja excluir esta anotação?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/hosts/${host.id}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        await fetchHost();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateHost = async () => {
    if (!host || !editHostForm.name.trim()) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/hosts/${host.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(editHostForm)
      });
      if (response.ok) {
        await fetchHost();
        setEditHostModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHost = async () => {
    if (!host || !confirm('Tem certeza que deseja excluir este host?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/hosts/${host.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        navigate({ to: '/clients/$clientId', params: { clientId: host.clientId } });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!host?.has_access || canEdit) {
      setCountdown('');
      return;
    }
    // We don't have an exact expiry timestamp from the host API endpoint yet, 
    // but the backend handles expiration. If they have access, it's valid.
    // For a real countdown, the backend should return `expires_at` along with `has_access`.
  }, [host, canEdit]);

  if (!user) {
    navigate({ to: '/login' });
    return null;
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="p-4 text-center text-muted-foreground">Carregando...</div>
      </AppLayout>
    );
  }

  if (!host || !client) {
    return (
      <AppLayout>
        <div className="p-4 text-center text-muted-foreground">Host não encontrado</div>
      </AppLayout>
    );
  }

  const canSeePassword = canEdit || host.has_access;
  const addressLabel = getHostAddressLabel(host.type);

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({ name: file.name, dataUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleRequestAccess = async () => {
    if (!justification.trim() || !host) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/access-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          host_id: host.id,
          client_id: host.clientId,
          reason: justification.trim(),
        })
      });
      if (response.ok) {
        setRequestSent(true);
        setJustification('');
        setRequestSheet(false);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erro ao solicitar acesso.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: '/clients/$clientId', params: { clientId: host.clientId } })}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-2xl">
                {getHostTypeIcon(host.type)}
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">{host.name}</h1>
                <p className="text-sm text-muted-foreground">{getHostTypeLabel(host.type)} • {client.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!canSeePassword && !requestSent && (
              <Button
                onClick={() => setRequestSheet(true)}
                size="sm"
                className="h-9 font-semibold glow-primary-sm"
              >
                <Lock className="w-4 h-4 mr-2" />
                Solicitar acesso
              </Button>
            )}
            {!canSeePassword && requestSent && (
              <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                Solicitação enviada
              </span>
            )}
            {canEdit && (
              <>
                <button
                  onClick={() => { setEditHostForm({ name: host.name, type: host.type, ip: host.ip || '', username: host.username || '', password: '' }); setEditHostModal(true); }}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                {user.level === 3 && (
                  <button
                    onClick={handleDeleteHost}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Countdown for N1 */}
        {host.has_access && !canEdit && (
          <div className="bg-success/10 border border-success/30 rounded-xl p-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-success" />
            <div>
              <p className="text-sm font-medium text-success">Acesso temporário ativo</p>
            </div>
          </div>
        )}

        {/* IP */}
        {host.type !== 'notes' && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{addressLabel}</label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-foreground font-mono text-sm flex-1 break-all">{host.ip}</p>
                <button
                  onClick={() => copyToClipboard(host.ip, 'ip')}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  {copied === 'ip' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usuário</label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-foreground font-mono text-sm flex-1">{host.username}</p>
                <button
                  onClick={() => copyToClipboard(host.username, 'user')}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  {copied === 'user' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Senha</label>
              {canSeePassword ? (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-foreground font-mono text-sm flex-1">
                    {showPassword ? host.password : '••••••••••••'}
                  </p>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(host.password, 'pass')}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    {copied === 'pass' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <div className="mt-2 space-y-3">
                  <p className="text-muted-foreground font-mono text-sm">••••••••••••</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Anotações / Procedimentos
            </label>
            <span className="text-xs text-muted-foreground">{host.notesList?.length ?? 0}</span>
          </div>

          {canEdit && (
            <div className="space-y-2 border border-border/60 rounded-lg p-3 bg-input/20">
              <input
                type="text"
                value={newNoteTitle}
                onChange={e => setNewNoteTitle(e.target.value)}
                placeholder="Título da anotação"
                className="w-full h-10 bg-input/50 border border-border rounded-md px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Informações, procedimento, observação..."
                className="w-full min-h-[80px] bg-input/50 border border-border rounded-md p-3 text-sm text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleAttachmentChange}
                className="hidden"
              />
              {attachment && (
                <div className="flex items-center gap-2 bg-accent/40 border border-border rounded-md px-3 py-2 text-xs">
                  <Paperclip className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate text-foreground/90">{attachment.name}</span>
                  <button
                    onClick={() => setAttachment(null)}
                    className="p-1 text-muted-foreground hover:text-destructive"
                    aria-label="Remover anexo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4 mr-1" />
                  Anexar arquivo
                </Button>
                <Button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  size="sm"
                  className="ml-auto"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {(host.notesList ?? []).length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/70">
                <StickyNote className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">Nenhuma anotação ainda</p>
              </div>
            )}
            {(host.notesList ?? []).map(note => (
              <div
                key={note.id}
                className="group bg-accent/30 border border-border/50 rounded-lg p-3 flex gap-3"
              >
                <div className="flex-1 min-w-0">
                  {note.title && (
                    <p className="text-sm font-semibold text-foreground mb-1 break-words">
                      {note.title}
                    </p>
                  )}
                  <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed break-words">
                    {note.text}
                  </p>
                  {note.attachmentDataUrl && note.attachmentName && (
                    <a
                      href={note.attachmentDataUrl}
                      download={note.attachmentName}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline bg-primary/10 px-2 py-1 rounded-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">{note.attachmentName}</span>
                    </a>
                  )}
                  <p className="text-[11px] text-muted-foreground/70 mt-1.5">
                    {note.authorName ? `${note.authorName} • ` : ''}
                    {new Date(note.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                {canEdit && (
                  <div className="flex flex-col gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => {
                        setEditNoteForm({
                          id: note.id,
                          title: note.title || '',
                          text: note.text,
                          attachmentName: note.attachmentName,
                          attachmentDataUrl: note.attachmentDataUrl
                        });
                        setEditNoteModal(true);
                      }}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center rounded-md hover:bg-primary/10"
                      aria-label="Editar anotação"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center rounded-md hover:bg-destructive/10"
                      aria-label="Remover anotação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={requestSheet} onOpenChange={setRequestSheet}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar acesso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Informe a justificativa para acessar a senha de <span className="text-foreground font-medium">{host.name}</span>
            </p>
            <textarea
              value={justification}
              onChange={e => setJustification(e.target.value)}
              placeholder="Descreva o motivo da solicitação..."
              className="w-full h-24 bg-input/50 border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Button
            onClick={handleRequestAccess}
            disabled={!justification.trim()}
            className="w-full h-11 text-base font-semibold"
          >
            Enviar solicitação
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={editHostModal} onOpenChange={setEditHostModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar host</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</label>
                <Input value={editHostForm.name} onChange={e => setEditHostForm({ ...editHostForm, name: e.target.value })} placeholder="Ex: Servidor Backup" className="mt-1 h-11 bg-input/50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</label>
                <div className="mt-1">
                  <Select value={editHostForm.type} onValueChange={(val: HostType) => setEditHostForm({ ...editHostForm, type: val })}>
                    <SelectTrigger className="w-full h-11 bg-input/50">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {(['server', 'pc', 'printer', 'dvr', 'router', 'switch', 'access', 'email', 'notes'] as HostType[]).map(t => (
                        <SelectItem key={t} value={t}>
                          <div className="flex items-center gap-2">
                            <span>{getHostTypeIcon(t)}</span>
                            <span>{getHostTypeLabel(t)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {editHostForm.type !== 'notes' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{addressLabel}</label>
                    <Input value={editHostForm.ip} onChange={e => setEditHostForm({ ...editHostForm, ip: e.target.value })} placeholder="Endereço" className="mt-1 h-11 bg-input/50 font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usuário</label>
                      <Input value={editHostForm.username} onChange={e => setEditHostForm({ ...editHostForm, username: e.target.value })} placeholder="admin" className="mt-1 h-11 bg-input/50 font-mono" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nova Senha (opcional)</label>
                      <Input value={editHostForm.password} onChange={e => setEditHostForm({ ...editHostForm, password: e.target.value })} placeholder="••••••" className="mt-1 h-11 bg-input/50 font-mono" />
                    </div>
                  </div>
                </>
              )}
          </div>
          <Button
            onClick={handleUpdateHost}
            disabled={!editHostForm.name.trim()}
            className="w-full h-11 text-base font-semibold mt-2"
          >
            Salvar alterações
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={editNoteModal} onOpenChange={setEditNoteModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar anotação</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Título (opcional)</label>
              <Input
                value={editNoteForm?.title || ''}
                onChange={e => setEditNoteForm(p => p ? { ...p, title: e.target.value } : null)}
                placeholder="Título da anotação"
                className="mt-1 h-11 bg-input/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Anotação</label>
              <textarea
                value={editNoteForm?.text || ''}
                onChange={e => setEditNoteForm(p => p ? { ...p, text: e.target.value } : null)}
                placeholder="Informações, procedimentos..."
                className="w-full h-32 mt-1 bg-input/50 border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            {/* Mantemos o anexo simples sem botão de upload para edição rápida, ou apenas exibimos o nome */}
            {editNoteForm?.attachmentName && (
              <div className="flex items-center gap-2 bg-accent/40 border border-border rounded-md px-3 py-2 text-xs">
                <Paperclip className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="flex-1 truncate text-foreground/90">{editNoteForm.attachmentName}</span>
                <button
                  onClick={() => setEditNoteForm(p => p ? { ...p, attachmentName: undefined, attachmentDataUrl: undefined } : null)}
                  className="p-1 text-muted-foreground hover:text-destructive"
                  aria-label="Remover anexo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <Button
            onClick={handleUpdateNote}
            disabled={!editNoteForm?.text.trim()}
            className="w-full h-11 text-base font-semibold mt-2"
          >
            Salvar anotação
          </Button>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
