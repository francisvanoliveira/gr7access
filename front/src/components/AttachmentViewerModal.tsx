import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AttachmentViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachmentName: string;
  attachmentDataUrl: string;
}

export function AttachmentViewerModal({ open, onOpenChange, attachmentName, attachmentDataUrl }: AttachmentViewerModalProps) {
  if (!open || !attachmentDataUrl) return null;

  const isPdf = attachmentName.toLowerCase().endsWith('.pdf') || attachmentDataUrl.startsWith('data:application/pdf');
  const isTxt = attachmentName.toLowerCase().endsWith('.txt') || attachmentDataUrl.startsWith('data:text/plain');
  const isWord = attachmentName.toLowerCase().endsWith('.doc') || attachmentName.toLowerCase().endsWith('.docx');
  const isExcel = attachmentName.toLowerCase().endsWith('.xls') || attachmentName.toLowerCase().endsWith('.xlsx');
  
  const requiresDownload = isWord || isExcel || (!isPdf && !isTxt);

  const getIcon = () => {
    if (isWord) return <FileText className="w-16 h-16 text-blue-500 mb-4" />;
    if (isExcel) return <FileSpreadsheet className="w-16 h-16 text-green-500 mb-4" />;
    return <File className="w-16 h-16 text-muted-foreground mb-4" />;
  };

  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !attachmentDataUrl || (!isPdf && !isTxt)) {
      setObjectUrl(null);
      return;
    }

    try {
      const arr = attachmentDataUrl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) {
        setObjectUrl(attachmentDataUrl);
        return;
      }
      
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      const blob = new Blob([u8arr], { type: mime });
      const url = URL.createObjectURL(blob);
      setObjectUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.error('Failed to create Object URL from base64:', e);
      setObjectUrl(attachmentDataUrl);
    }
  }, [attachmentDataUrl, isPdf, isTxt, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] h-[85vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="truncate pr-4 flex-1">{attachmentName}</DialogTitle>
          <a
            href={attachmentDataUrl}
            download={attachmentName}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-md shrink-0"
          >
            <Download className="w-4 h-4" />
            Baixar Original
          </a>
        </DialogHeader>

        <div className="flex-1 bg-accent/20 flex flex-col min-h-0 relative">
          {isPdf || isTxt ? (
            <iframe
              src={objectUrl || ''}
              className="w-full h-full border-none"
              title={attachmentName}
            />
          ) : requiresDownload ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              {getIcon()}
              <h3 className="text-xl font-semibold text-foreground mb-2">Formato não suportado para pré-visualização</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Este arquivo é um documento do Office ou de formato incompatível com a web. 
                Para visualizá-lo corretamente, faça o download para o seu computador.
              </p>
              <a
                href={attachmentDataUrl}
                download={attachmentName}
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg glow-primary-sm"
              >
                <Download className="w-5 h-5 mr-2" />
                Fazer Download Agora
              </a>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
