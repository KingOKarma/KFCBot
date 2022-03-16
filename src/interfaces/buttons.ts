import Client from "../client/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Run = (client: Client, interaction: any) => void;

export interface Buttons {
    name: string;
    run: Run;

}
