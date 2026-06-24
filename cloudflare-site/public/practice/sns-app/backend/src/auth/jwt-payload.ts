export type JwtPayload = {
  sub: number; // ユーザーID（JWTの慣習で subject の略）
  username: string;
};
