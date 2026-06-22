export const fmt = (n: number) =>
  `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;

export const fmtNum = (n: number) => Number(n).toLocaleString();

export const cn = (...classes: (string | undefined | false)[]) =>
  classes.filter(Boolean).join(" ");

export const calcCost = (qty: number, ratePerThousand: number): number =>
  Math.ceil((qty / 1000) * ratePerThousand);

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
