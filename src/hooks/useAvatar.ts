/**
 * useAvatar - helper untuk ambil foto profil user
 * Kalau user sudah ganti foto → pakai foto baru (dari localStorage)
 * Kalau belum → pakai profile.jpg default
 */
export function getAvatarSrc(defaultImg: string): string {
  const saved = localStorage.getItem("homia_avatar");
  return saved || defaultImg;
}
