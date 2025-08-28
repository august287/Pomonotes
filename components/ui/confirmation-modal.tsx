"use client";

import { Button } from "./button";
import { Card } from "./card";
import Image from "next/image";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="pompompurin-card p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          <h2 className="text-xl font-bold pompompurin-text mb-4">{title}</h2>

          <p className="pompompurin-text mb-6 truncate px-2">{message}</p>

          <div className="flex justify-center mb-6">
            <Image
              src="/images/gifs/delete.gif"
              alt="Delete animation"
              width={100}
              height={100}
              className="rounded-lg"
            />
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={onClose}
              variant="outline"
              className="pompompurin-button bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
            >
              No, Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="pompompurin-button bg-red-500 hover:bg-red-600 text-white"
            >
              Yes, Delete
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
