import { CekMarginItem, Produk, StokItem } from './types';

export function calculateLocalMargin(
  produkList: Produk[],
  stokList: StokItem[]
): CekMarginItem[] {
  // Map produk for quick lookup
  const produkMap = new Map<string, Produk>();
  
  for (const p of produkList) {
    if (!p.kode) continue;
    produkMap.set(p.kode.toString().trim(), p);
  }

  const result: CekMarginItem[] = [];
  let no = 1;

  for (const s of stokList) {
    if (!s.kode) continue;
    const kode = s.kode.toString().trim();
    const produk = produkMap.get(kode);
    
    // Default values if no matching produk found
    const hpp = produk ? Number(produk.hpp) || 0 : 0;
    const hrg1 = produk ? Number(produk.hrg1) || 0 : 0;
    const hrg2 = produk ? Number(produk.hrg2) || 0 : 0;
    const hrg3 = produk ? Number(produk.hrg3) || 0 : 0;
    
    // In original CekMarginItem, we only have hrg1, hrg2, hrg3.
    // However, the original calculation in syncBranchStok might have updated stok_cabang.
    // Let's calculate the margin
    const mrg1 = hrg1 - hpp;
    const persen1 = hpp > 0 ? (mrg1 / hpp) * 100 : 0;
    
    const mrg2 = hrg2 - hpp;
    const persen2 = hpp > 0 ? (mrg2 / hpp) * 100 : 0;
    
    const mrg3 = hrg3 - hpp;
    const persen3 = hpp > 0 ? (mrg3 / hpp) * 100 : 0;
    
    // A margin is considered minus if selling price is > 0 and margin is < 0
    const isMinus = (hrg1 > 0 && mrg1 < 0) || (hrg2 > 0 && mrg2 < 0) || (hrg3 > 0 && mrg3 < 0);
    
    result.push({
      no,
      kode,
      nama: s.nama || produk?.nama || '',
      namaSupplier: produk?.namaSupplier || produk?.supplier || '',
      stok: Number(s.stok) || 0,
      hpp,
      hrg1,
      mrg1,
      persen1,
      hrg2,
      mrg2,
      persen2,
      hrg3,
      mrg3,
      persen3,
      // Store a custom flag if needed for sorting or styling
      ...(isMinus ? { isMinus: true } : {})
    });
    
    no++;
  }

  // Sort by minus first, then by name
  return result.sort((a, b) => {
    const aMinus = (a as any).isMinus;
    const bMinus = (b as any).isMinus;
    
    if (aMinus && !bMinus) return -1;
    if (!aMinus && bMinus) return 1;
    return a.nama.localeCompare(b.nama);
  });
}
