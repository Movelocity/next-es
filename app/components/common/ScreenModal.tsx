import React from 'react'
import cn from 'classnames'

type ModalProps = {
  show: boolean
  stayBackground?: boolean
  classNames?: string
  closeModal: () => void
  children: React.ReactNode
  closeOnBgClick?: boolean
}

const ScreenModal: React.FC<ModalProps> = ({
  show,
  stayBackground = false,
  classNames = 'white',
  closeModal,
  closeOnBgClick = true,
  children,
}) => {
  // Explicitly typing the backgroundStyle as React.CSSProperties
  const backgroundStyle: React.CSSProperties = stayBackground
    ? { visibility: show ? 'visible' as const : 'hidden' as const }
    : {}

  const handleBackgroundClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnBgClick)
      closeModal()
  }

  return (
    (stayBackground || show)
      ? (
        <div
          className="modal-overlay"
          style={backgroundStyle}
          onClick={handleBackgroundClick}
        >
          <div
            className={cn('relative flex flex-col items-center w-fit p-2', classNames)}
            style={{ maxWidth: '80vw', maxHeight: '80vh' }}
          >
            {children}
          </div>
        </div>
      )
      : null
  )
}

export default ScreenModal
