export interface KarnatakaLocationItem {
  name: string;
  category: 'Major City' | 'District' | 'Industrial Hub' | 'Bengaluru Area';
  popular?: boolean;
}

export const KARNATAKA_PROJECT_LOCATIONS: KarnatakaLocationItem[] = [
  // Primary cities requested by user
  { name: 'Bangalore', category: 'Major City', popular: true },
  { name: 'Bengaluru', category: 'Major City', popular: true },
  { name: 'Kolar', category: 'Major City', popular: true },
  { name: 'Kolar Gold Fields (KGF)', category: 'Industrial Hub' },
  { name: 'Narasapura Industrial Area, Kolar', category: 'Industrial Hub', popular: true },
  { name: 'Tumakuru (Tumkur)', category: 'Major City', popular: true },
  { name: 'Vasanthanarasapura Industrial Area, Tumakuru', category: 'Industrial Hub' },
  { name: 'Chikkaballapur', category: 'Major City', popular: true },
  { name: 'Ramanagara', category: 'Major City' },
  { name: 'Bidadi Industrial Area, Ramanagara', category: 'Industrial Hub', popular: true },
  { name: 'Mysore (Mysuru)', category: 'Major City', popular: true },
  { name: 'Mandya', category: 'Major City' },
  { name: 'Hassan', category: 'Major City' },
  { name: 'Shivamogga (Shimoga)', category: 'Major City' },
  { name: 'Davanagere', category: 'Major City' },
  { name: 'Chitradurga', category: 'Major City' },
  { name: 'Hubballi-Dharwad', category: 'Major City', popular: true },
  { name: 'Belagavi (Belgaum)', category: 'Major City', popular: true },
  { name: 'Mangalore (Mangaluru)', category: 'Major City', popular: true },
  { name: 'Udupi', category: 'Major City' },
  { name: 'Ballari (Bellary)', category: 'Major City' },
  { name: 'Kalaburagi (Gulbarga)', category: 'Major City' },
  { name: 'Vijayapura (Bijapur)', category: 'Major City' },
  { name: 'Bidar', category: 'Major City' },
  { name: 'Raichur', category: 'Major City' },
  { name: 'Bagalkot', category: 'Major City' },
  { name: 'Gadag', category: 'Major City' },
  { name: 'Haveri', category: 'Major City' },
  { name: 'Koppal', category: 'Major City' },
  { name: 'Yadgir', category: 'Major City' },
  { name: 'Chamarajanagar', category: 'Major City' },
  { name: 'Chikkamagaluru', category: 'Major City' },
  { name: 'Kodagu (Madikeri)', category: 'Major City' },
  { name: 'Uttara Kannada (Karwar)', category: 'Major City' },

  // Key Bengaluru & Karnataka Industrial / Project Corridors
  { name: 'Devanahalli (Aerospace & KIADB Tech Park)', category: 'Industrial Hub', popular: true },
  { name: 'Peenya Industrial Area, Bangalore', category: 'Industrial Hub', popular: true },
  { name: 'Whitefield, Bangalore', category: 'Bengaluru Area', popular: true },
  { name: 'Electronic City, Bangalore', category: 'Bengaluru Area', popular: true },
  { name: 'Sahakarnagar, Bangalore', category: 'Bengaluru Area', popular: true },
  { name: 'Hebbal, Bangalore', category: 'Bengaluru Area', popular: true },
  { name: 'Yelahanka, Bangalore', category: 'Bengaluru Area', popular: true },
  { name: 'Bommasandra Industrial Area, Bangalore', category: 'Industrial Hub' },
  { name: 'Hosakote Industrial Belt', category: 'Industrial Hub', popular: true },
  { name: 'Jigani Industrial Area, Bangalore', category: 'Industrial Hub' },
  { name: 'Doddaballapur Industrial Area', category: 'Industrial Hub' },
  { name: 'Nelamangala, Bangalore', category: 'Industrial Hub' },
  { name: 'Attibele Industrial Area', category: 'Industrial Hub' },
  { name: 'Manyata Tech Park, Bangalore', category: 'Bengaluru Area' },
  { name: 'Harohalli Industrial Area, Kanakapura', category: 'Industrial Hub' },
];

/**
 * Filter and sort locations based on query prefix priority
 * (e.g. typing "Ban" puts "Bangalore" first, "Kol" puts "Kolar" first)
 */
export function getMatchingKarnatakaLocations(query: string): KarnatakaLocationItem[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    // Return popular locations first when empty
    return KARNATAKA_PROJECT_LOCATIONS.filter((l) => l.popular);
  }

  // Exact or prefix matches first, then substring matches
  const prefixMatches: KarnatakaLocationItem[] = [];
  const substringMatches: KarnatakaLocationItem[] = [];

  for (const item of KARNATAKA_PROJECT_LOCATIONS) {
    const lowerName = item.name.toLowerCase();
    if (lowerName.startsWith(q)) {
      prefixMatches.push(item);
    } else if (lowerName.includes(q)) {
      substringMatches.push(item);
    }
  }

  return [...prefixMatches, ...substringMatches].slice(0, 8);
}
