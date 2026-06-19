export type DevLoginAccount = {
  email: string;
  password: string;
  label?: string;
};

const parseAccounts = (value: string | null): DevLoginAccount[] => {
  if (!value) return [];

  try {
    const accounts = JSON.parse(value);

    if (!Array.isArray(accounts)) return [];

    return accounts.filter(
      (account): account is DevLoginAccount =>
        typeof account === "object" &&
        account !== null &&
        typeof account.email === "string" &&
        typeof account.password === "string",
    );
  } catch {
    return [];
  }
};

export const loadDevLoginAccounts = (storageKey: string) => {
  return parseAccounts(localStorage.getItem(storageKey));
};

export const saveDevLoginAccount = (
  storageKey: string,
  account: DevLoginAccount,
) => {
  const email = account.email.trim();

  if (!email) return;

  const accounts = loadDevLoginAccounts(storageKey);
  const existingIndex = accounts.findIndex(
    (savedAccount) => savedAccount.email.toLowerCase() === email.toLowerCase(),
  );
  const nextAccount = {
    ...account,
    email,
  };

  if (existingIndex >= 0) {
    accounts[existingIndex] = nextAccount;
  } else {
    accounts.push(nextAccount);
  }

  localStorage.setItem(storageKey, JSON.stringify(accounts));
};

export const removeDevLoginAccount = (storageKey: string, email: string) => {
  const nextAccounts = loadDevLoginAccounts(storageKey).filter(
    (account) => account.email.toLowerCase() !== email.toLowerCase(),
  );

  localStorage.setItem(storageKey, JSON.stringify(nextAccounts));

  return nextAccounts;
};
