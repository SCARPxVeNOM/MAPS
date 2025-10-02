export interface IERC20 {
    name(): Promise<string>;
    symbol(): Promise<string>;
    decimals(): Promise<number>;
    balanceOf(account: string): Promise<string>;
    allowance(owner: string, spender: string): Promise<string>;
    approve(spender: string, amount: string): Promise<boolean>;
    transfer(recipient: string, amount: string): Promise<boolean>;
    transferFrom(sender: string, recipient: string, amount: string): Promise<boolean>;
}
export type Address = string;
