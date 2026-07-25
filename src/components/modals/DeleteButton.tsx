"use client";

import { Button } from "@/components/primitives/AntD";
import ConfirmDelete from "@/components/modals/ConfirmDelete";
import ModalPopup from "@/components/modals/ModalPopup";
import { useState } from "react";
import styles from "@/components/modals/ConfirmDelete/ConfirmDelete.module.css";

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
    <div className={styles.triggerRoot}>
      <Button onClick={showModal} className="decline-button">
        {buttonText} {itemName}
      </Button>

      <ModalPopup
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={`Remove ${itemName}`}
        dialogClassName={styles.dialog}
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
