import React from 'react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  open = false,
  title = 'Confirm action',
  message = 'Are you sure you want to continue?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} type="button">
            {cancelLabel}
          </Button>
          <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm} type="button">
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-gray-mid">{message}</p>
    </Modal>
  );
}