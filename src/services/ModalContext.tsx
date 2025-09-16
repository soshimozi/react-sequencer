import React, { createContext, useContext, useCallback, useState } from 'react';
import { ModalRenderer } from './ModalRenderer';

export type ModalContent = {
    component: React.ComponentType<any>;
    props?: any;
    closeOnEscape?: boolean;
    closeOnBackdrop?: boolean;
    resolve: (value: any) => void;
    onClose?: (result?: any) => void;
    borderColor: string;
};

type ModalContextType = {
    open: <T>(
        component: React.ComponentType<any>,
        options?: {
            props?: any;
            closeOnBackdrop?: boolean;
            closeOnEscape?: boolean;
            onClose?: (result?: any) => void;
            borderColor?: string
        }
    ) => Promise<T>;
    close: (result?: any) => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const useModal = () => {
    const ctx = useContext(ModalContext);
    if (!ctx) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return ctx;
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [modal, setModal] = useState<ModalContent | null>(null);

    const open: ModalContextType["open"] = (component, options = {}) => {
        return new Promise((resolve) => {
            setModal({
                component,
                props: options.props,
                closeOnBackdrop: options.closeOnBackdrop ?? true,
                closeOnEscape: options.closeOnEscape ?? true,
                onClose: options.onClose,
                resolve,
                borderColor: options.borderColor ?? '#0905AB'
            });
        });
    };

    const close = (result?: any) => {

        if(modal?.onClose) {
            modal.onClose(result);
        }

        if (modal?.resolve) {
            modal.resolve(result);
        }
        setModal(null);
    };

    return (
        <ModalContext.Provider value={{ open, close }}>
            {children}
            <ModalRenderer modal={modal} close={close} />
        </ModalContext.Provider>
    );
};
