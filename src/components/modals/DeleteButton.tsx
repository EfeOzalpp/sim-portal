"use client";

import { Button } from "@/components/button/button-component";
import ConfirmDelete from "@/components/modals/ConfirmDelete";
import ModalPopup from "@/components/modals/ModalPopup";
import { confirmDeleteDialogClassName } from "@/components/modals/ConfirmDelete/styles";
import { useState } from "react";

interface DeleteButtonProps {
  onConfirm: () => void;
  itemName: string;
  warningText?: string;
  buttonText?: string;
}

export default function DeleteButton({
  onConfirm,
  itemName,
  warningText,
  buttonText = "Delete",
}: DeleteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => setIsModalOpen(true);

  return (
    <div className="mt-[var(--spacing-md)]">
      <Button onClick={showModal} tone="danger">
        {buttonText} {itemName}
      </Button>

      <ModalPopup
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={`Remove ${itemName}`}
        dialogClassName={confirmDeleteDialogClassName}
      >
        <ConfirmDelete
          itemName={itemName.replace(/\?$/, "")}
          itemType="item"
          warningText={warningText}
          onConfirm={onConfirm}
          onConfirmed={() => setIsModalOpen(false)}
        />
      </ModalPopup>
    </div>
  );
}
