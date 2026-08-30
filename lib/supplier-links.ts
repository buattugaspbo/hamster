export type SupplierLink = {
  marketplace: "Shopee";
  url: string;
  sourcePrice: number;
  sourceTitle: string;
  checkedAt: string;
};

// Harga ini hanya acuan belanja admin; harga supplier dapat berubah sewaktu-waktu.
export const supplierLinks: Record<string, SupplierLink> = {
  p42: { marketplace: "Shopee", url: "https://shopee.co.id/H3501-Dayang-Hamster-Cage-Kandang-Besi-Hamster-1-Set-Uk-34x27x27cm-i.207757182.25166420764", sourcePrice: 161000, sourceTitle: "H3501 Dayang Hamster Cage Kandang Besi 1 Set 34×27×27 cm", checkedAt: "2026-08-30" },
  p28: { marketplace: "Shopee", url: "https://shopee.co.id/Kandang-Hamster-Full-Akrilik-100x50x50cm--i.66673154.7548433250", sourcePrice: 1485000, sourceTitle: "Kandang Hamster Full Akrilik 100×50×50 cm", checkedAt: "2026-08-30" },
  p29: { marketplace: "Shopee", url: "https://shopee.co.id/Kandang-Hamster-Acrylic-Metal-Frame-100-120-cm-%E2%80%93-BUCATSTATE-DIY-Versi-3.0-i.1125732781.40013623904", sourcePrice: 5880000, sourceTitle: "Kandang Hamster Acrylic Metal Frame 100/120 cm – BUCATSTATE DIY Versi 3.0", checkedAt: "2026-08-30" },
  p30: { marketplace: "Shopee", url: "https://shopee.co.id/Kandang-Hamster-Akrilik-2-Tingkat-PxLxT-80x60x100cm-i.66673154.12025824225", sourcePrice: 2000000, sourceTitle: "Kandang Hamster Akrilik 2 Tingkat 80×60×100 cm", checkedAt: "2026-08-30" },
  p31: { marketplace: "Shopee", url: "https://shopee.co.id/Kandang-Hamster-Akrilik-Tingkat-2-PxLxT-100x50x100cm-i.66673154.22551162951", sourcePrice: 2640000, sourceTitle: "Kandang Hamster Akrilik Tingkat 2 100×50×100 cm", checkedAt: "2026-08-30" },
  p32: { marketplace: "Shopee", url: "https://shopee.co.id/Kandang-Hamster-Akrilik-PxLxT-100x40x30cm-i.66673154.51550681151", sourcePrice: 1050000, sourceTitle: "Kandang Hamster Akrilik 100×40×30 cm", checkedAt: "2026-08-30" },
  p33: { marketplace: "Shopee", url: "https://shopee.co.id/search?keyword=TeraTerarium%20Hamster%20Akrilik%20Kayu%20Trapesium", sourcePrice: 395000, sourceTitle: "TeraTerarium Hamster Akrilik Kayu Trapesium", checkedAt: "2026-08-30" },
  p34: { marketplace: "Shopee", url: "https://shopee.co.id/Corn-Cob-Bedding-1L-Hamster-Bedding-Small-Pets-Bedding-Alas-Kandang-Hamster-Dingin-Nyaman-Anti-Debu-i.885562650.26691036303", sourcePrice: 11900, sourceTitle: "Corn Cob Bedding 1L", checkedAt: "2026-08-30" },
  p35: { marketplace: "Shopee", url: "https://shopee.co.id/COCOPEAT-HAMSTER-BEDDING-STERIL-ALAMI-50gr-i.434455447.26511803592", sourcePrice: 5000, sourceTitle: "Cocopeat Hamster Bedding Steril Alami 50 g", checkedAt: "2026-08-30" },
  p36: { marketplace: "Shopee", url: "https://shopee.co.id/hammum", sourcePrice: 25500, sourceTitle: "SEEDLICIOUS Seedmix", checkedAt: "2026-08-30" },
  p37: { marketplace: "Shopee", url: "https://shopee.co.id/hammum", sourcePrice: 29999, sourceTitle: "Tissue Bedding Premium Hello Syrian", checkedAt: "2026-08-30" },
  p38: { marketplace: "Shopee", url: "https://shopee.co.id/hammum", sourcePrice: 20000, sourceTitle: "HAM SPA Natural Sand Bath", checkedAt: "2026-08-30" },
  p39: { marketplace: "Shopee", url: "https://shopee.co.id/vonsakuranipon", sourcePrice: 33999, sourceTitle: "HAMSF Bunny Rabbit Food 1 kg", checkedAt: "2026-08-30" },
  p40: { marketplace: "Shopee", url: "https://shopee.co.id/hello.syrian", sourcePrice: 60000, sourceTitle: "Paper Bedding by Hamppiness", checkedAt: "2026-08-30" },
  p41: { marketplace: "Shopee", url: "https://shopee.co.id/vonsakuranipon", sourcePrice: 9900, sourceTitle: "Pasir Alas Hamster Jolly 1 kg", checkedAt: "2026-08-30" },
};

export function getSupplierLink(productId: string) {
  return supplierLinks[productId];
}
