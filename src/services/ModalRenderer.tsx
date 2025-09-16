import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { type ModalContent } from "./ModalContext";

type ModalRendererProps = {
    modal: ModalContent | null;
    close: (result?: any) => void;
};

export const ModalRenderer: React.FC<ModalRendererProps> = ({ modal, close }) => {
    useEffect(() => {
        if (!modal?.closeOnEscape) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                close();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [modal, close]);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {modal && (
                <motion.div
                    style={backdropStyle}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                        if(modal.closeOnBackdrop) {
                            close();
                        }
                    }}
                >
                    <motion.div
                        style={gradientWrapperStyle()}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                      <div style={modalBoxStyle}>
                        <modal.component {...modal.props} onClose={close} />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 998
};

const gradientWrapperStyle = (): React.CSSProperties => {
    return {
    zIndex: 999,
    display: 'inline-block',
    border: "3px solid #1d1f23",
    backgroundColor: "#282b32",
    boxShadow: " 0 0 2px 1px rgba(0, 0, 0, .8), 0 5px 25px 10px rgba(0, 0, 0, 0.25), 0 -1px 1px rgba(170, 184, 217, 0.15) inset"    }
};

const modalBoxStyle: React.CSSProperties = {
      margin: "4px",
      padding: "10px 10px 10px 10px",
      fontSize: "110%"    
};