"use client";

import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { X } from "lucide-react";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  createdAt: string;
}

export function NoteModal({
  isOpen,
  onClose,
  title,
  content,
  createdAt,
}: NoteModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <Card className="pompompurin-card w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <CardTitle className="text-xl break-words leading-tight word-break">
                {title}
              </CardTitle>
              <p className="text-sm opacity-70 mt-2">{createdAt}</p>
            </div>
            <Button
              onClick={onClose}
              size="sm"
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[60vh]">
          <div className="whitespace-pre-wrap break-words text-base leading-relaxed word-break">
            {content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
