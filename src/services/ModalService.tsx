type ModalContent = {
    component: React.ComponentType<any>;
    props?: any;
    resolve?: (value: any) => void;
};

class ModalService {
    private listeners: ((modal: ModalContent | null) => void)[] = [];

    private modal: ModalContent | null = null;

    subscribe(listener: (modal: ModalContent | null) => void) {
        this.listeners.push(listener);
        listener(this.modal); // Initial call
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify() {
        for (const listener of this.listeners) {
            listener(this.modal);
        }
    }

    open<T>(component: React.ComponentType<any>, props?: any): Promise<T> {
        return new Promise<T>((resolve) => {
            this.modal = { component, props, resolve };
            this.notify();
        });
    }

    close(result?: any) {
        if (this.modal?.resolve) {
            this.modal.resolve(result);
        }
        this.modal = null;
        this.notify();
    }
}

export const modalService = new ModalService();
