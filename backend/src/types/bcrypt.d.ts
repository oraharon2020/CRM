declare module 'bcrypt' {
  /**
   * Generate a hash for the given string.
   * @param data The data to be hashed.
   * @param saltOrRounds The salt to be used to hash the password. If specified as a number, a salt will be generated with the specified number of rounds.
   */
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;

  /**
   * Compare a string to a hash to determine if they are equivalent.
   * @param data The data to be compared.
   * @param encrypted The hash to be compared to.
   */
  export function compare(data: string, encrypted: string): Promise<boolean>;

  /**
   * Generate a salt for the given number of rounds.
   * @param rounds The number of rounds to use. Defaults to 10.
   */
  export function genSalt(rounds?: number): Promise<string>;
}
