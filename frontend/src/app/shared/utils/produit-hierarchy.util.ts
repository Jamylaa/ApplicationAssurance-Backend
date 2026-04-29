import {
  ConditionEligibilite,
  Couverture,
  Exclusion,
  Garantie,
  PackGarantie,
  Pack,
  Produit,
  PlafondLimite,
  RegleCalculGarantie,
  NiveauCouverture,
  TypeProduit,
  TypeMontant,
  Statut
} from '../../models/entities.model';

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? '').trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>((accumulator, [key, entry]) => {
    accumulator[key] = String(entry ?? '').trim();
    return accumulator;
  }, {});
}

function buildGarantieMap(garanties: Garantie[]): Map<string, Garantie> {
  return new Map(
    (garanties ?? [])
      .filter((garantie) => Boolean(garantie.idGarantie))
      .map((garantie) => [garantie.idGarantie as string, garantie])
  );
}

function buildPackGarantieMap(packGaranties: PackGarantie[]): Map<string, PackGarantie[]> {
  return (packGaranties ?? []).reduce<Map<string, PackGarantie[]>>((accumulator, relation) => {
    const packId = String(relation.packId ?? '').trim();
    if (!packId) {
      return accumulator;
    }

    accumulator.set(packId, [...(accumulator.get(packId) ?? []), relation]);
    return accumulator;
  }, new Map<string, PackGarantie[]>());
}

export function normalizeCouverture(couverture: Partial<Couverture> | null | undefined): Couverture {
  return {
    idCouverture: String(couverture?.idCouverture ?? ''),
    nom: String(couverture?.nom ?? ''),
    description: String(couverture?.description ?? ''),
    tauxCouverture: Number(couverture?.tauxCouverture ?? 0),
    plafond: Number(couverture?.plafond ?? 0),
    franchise: Number(couverture?.franchise ?? 0),
    conditions: couverture?.conditions ?? []
  };
}

export function normalizePlafond(plafond: Partial<PlafondLimite> | null | undefined): PlafondLimite {
  return {
    idPlafond: String(plafond?.idPlafond ?? ''),
    type: String(plafond?.type ?? ''),
    valeur: Number(plafond?.valeur ?? 0),
    periode: String(plafond?.periode ?? ''),
    unite: String(plafond?.unite ?? '')
  };
}

export function normalizeConditionEligibilite(
  condition: Partial<ConditionEligibilite> | null | undefined
): ConditionEligibilite | undefined {
  if (!condition) {
    return undefined;
  }

  return {
    idCondition: String(condition.idCondition ?? ''),
    ageMinimum: condition.ageMinimum !== undefined ? Number(condition.ageMinimum) : undefined,
    ageMaximum: condition.ageMaximum !== undefined ? Number(condition.ageMaximum) : undefined,
    typeClient: (condition.typeClient as any) ?? 'INDIVIDUEL',
    conditionsMedicales: Array.isArray(condition.conditionsMedicales) ? condition.conditionsMedicales : [],
    ancienneteContratMois: Number(condition.ancienneteContratMois ?? 0),
    exclusionMaladiesChroniques: Boolean(condition.exclusionMaladiesChroniques),
    exclusions: condition.exclusions ?? [],
    documentsRequis: condition.documentsRequis ?? []
  };
}

export function normalizeExclusion(exclusion: Partial<Exclusion> | null | undefined): Exclusion | undefined {
  if (!exclusion) {
    return undefined;
  }

  return {
    idExclusion: String(exclusion.idExclusion ?? ''),
    description: String(exclusion.description ?? ''),
    type: String(exclusion.type ?? ''),
    conditions: exclusion.conditions ?? []
  };
}

export function normalizeRegleCalcul(regle: Partial<RegleCalculGarantie> | null | undefined): RegleCalculGarantie | undefined {
  if (!regle) {
    return undefined;
  }

  return {
    idRegle: String(regle.idRegle ?? ''),
    formuleRemboursement: String(regle.formuleRemboursement ?? '').trim(),
    baseCalcul: regle.baseCalcul ?? 'FRAIS_REELS',
    cumulAutresGarantiesAutorise: Boolean(regle.cumulAutresGarantiesAutorise),
    prioriteGarantie: Number(regle.prioriteGarantie ?? 0),
    descriptionRegle: String(regle.descriptionRegle ?? '').trim(),
    typeCalcul: String(regle.typeCalcul ?? ''),
    formule: String(regle.formule ?? ''),
    parametres: regle.parametres ?? {}
  };
}

export function normalizeGarantie(garantie: Partial<Garantie> | null | undefined): Garantie {
  const couvertures = Array.isArray(garantie?.couvertures)
    ? garantie?.couvertures.map((item) => normalizeCouverture(item))
    : [];
  const plafondsLimites = Array.isArray(garantie?.plafondsLimites)
    ? garantie?.plafondsLimites.map((item) => normalizePlafond(item))
    : [];
  const tauxRemboursement = garantie?.tauxRemboursement ?? 0;
  const plafondAnnuel = garantie?.plafondAnnuel ?? 0;
  const statut = garantie?.statut ?? Statut.ACTIF;

  return {
    idGarantie: String(garantie?.idGarantie ?? ''),
    nomGarantie: String(garantie?.nomGarantie ?? '').trim(),
    description: String(garantie?.description ?? '').trim(),
    statut,
    typeMontant: garantie?.typeMontant ?? TypeMontant.FRAIS_REELS,
    typePlafond: (garantie?.typePlafond as any) ?? 'ANNUEL',
    plafondAnnuel: Number(plafondAnnuel),
    plafondMensuel: Number(garantie?.plafondMensuel ?? 0),
    plafondParActe: Number(garantie?.plafondParActe ?? 0),
    franchise: Number(garantie?.franchise ?? 0),
    coutMoyenParSinistre: Number(garantie?.coutMoyenParSinistre ?? 0),
    dureeMinContrat: Number(garantie?.dureeMinContrat ?? 12),
    dureeMaxContrat: Number(garantie?.dureeMaxContrat ?? 60),
    resiliableAnnuellement: Boolean(garantie?.resiliableAnnuellement ?? true),
    creePar: String(garantie?.creePar ?? 'admin'),
    dateCreation: String(garantie?.dateCreation ?? new Date().toISOString()),
    dateModification: String(garantie?.dateModification ?? new Date().toISOString()),
    dateDesactivation: garantie?.dateDesactivation,
    tauxRemboursement: Number(tauxRemboursement),
    // Champs legacy pour compatibilité
    typeGarantie: garantie?.typeGarantie,
    couvertures,
    plafondsLimites,
    conditionsEligibilite: normalizeConditionEligibilite(garantie?.conditionsEligibilite),
    regleCalcul: normalizeRegleCalcul(garantie?.regleCalcul),
    exclusions: garantie?.exclusions
  };
}

export function normalizeGaranties(garanties: Garantie[]): Garantie[] {
  return (garanties ?? []).map((garantie) => normalizeGarantie(garantie));
}

function normalizeLegacyPackGuarantees(
  pack: Partial<Pack>,
  garantieMap: Map<string, Garantie>
): PackGarantie[] {
  // Les garanties legacy ne sont plus utilisées, on retourne un tableau vide
  return [];
}

export function normalizePackGarantie(
  packGarantie: Partial<PackGarantie> | null | undefined,
  garantieMap?: Map<string, Garantie>
): PackGarantie {
  const packId = String(packGarantie?.packId ?? '').trim();
  const garantieId = String(packGarantie?.garantieId ?? '').trim();
  const garantie = packGarantie?.garantie
    ? normalizeGarantie(packGarantie.garantie)
    : garantieMap?.get(garantieId);

  return {
    idPackGarantie: String(packGarantie?.idPackGarantie ?? ''),
    packId: packId || '',
    idGarantie: garantieId,
    garantieId,
    garantie,
    tauxRemboursement: Number(
      packGarantie?.tauxRemboursement ?? garantie?.tauxRemboursement ?? 0
    ),
    plafond: Number(
      packGarantie?.plafond ?? garantie?.plafondAnnuel ?? 0
    ),
    plafondAnnuel: Number(
      packGarantie?.plafondAnnuel ?? garantie?.plafondAnnuel ?? 0
    ),
    plafondParActe: Number(packGarantie?.plafondParActe ?? 0),
    delaiCarence: Number(packGarantie?.delaiCarence ?? 0),
    priorite: Number(packGarantie?.priorite ?? 1),
    actif: Boolean(packGarantie?.actif ?? true),
    dateActivation: String(packGarantie?.dateActivation ?? new Date().toISOString()),
    dateDesactivation: packGarantie?.dateDesactivation,
    estOptionnelle: Boolean(packGarantie?.estOptionnelle ?? false),
    supplementPrix: Number(packGarantie?.supplementPrix ?? 0),
    // Champs legacy pour compatibilité
    tauxCouvertureSpecifique: packGarantie?.tauxCouvertureSpecifique,
    incluse: packGarantie?.incluse,
    optionnelle: packGarantie?.optionnelle,
    prixAdditionnel: packGarantie?.prixAdditionnel,
    conditionsSpeciales: packGarantie?.conditionsSpeciales,
    conditionsSpecifiques: packGarantie?.conditionsSpecifiques,
    nomGarantie: garantie?.nomGarantie || '',
    typeMontant: garantie?.typeMontant || TypeMontant.FRAIS_REELS,
    franchise: Number(garantie?.franchise ?? 0)
  };
}

export function normalizePack(
  pack: Partial<Pack> | null | undefined,
  produitsMap?: Map<string, Produit>,
  garantieMap?: Map<string, Garantie>,
  packGarantiesByPackId?: Map<string, PackGarantie[]>
): Pack {
  const packId = String(pack?.idPack ?? '').trim();
  const externalRelations = packId ? packGarantiesByPackId?.get(packId) ?? [] : [];
  const garantiesRelations = Array.isArray(pack?.garanties) && pack?.garanties.length
    ? pack.garanties.map((garantie) => normalizePackGarantie(garantie, garantieMap))
    : externalRelations.length
      ? externalRelations.map((garantie) => normalizePackGarantie(garantie, garantieMap))
      : normalizeLegacyPackGuarantees(pack ?? {}, garantieMap ?? new Map()).map((garantie) =>
        normalizePackGarantie(garantie, garantieMap)
      );

  return {
    idPack: String(pack?.idPack ?? ''),
    nomPack: String(pack?.nomPack ?? '').trim(),
    description: String(pack?.description ?? '').trim(),
    produitId: String(pack?.produitId ?? '').trim(),
    nomProduit: produitsMap?.get(String(pack?.produitId ?? '').trim())?.nomProduit || '',
    prixMensuel: Number(pack?.prixMensuel ?? 0),
    dureeMinContrat: Number(pack?.dureeMinContrat ?? 0),
    dureeMaxContrat: Number(pack?.dureeMaxContrat ?? 0),
    niveauCouverture: (pack?.niveauCouverture ?? NiveauCouverture.PREMIUM) as Pack['niveauCouverture'],
    statut: pack?.statut ?? Statut.ACTIF,
    dateCreation: String(pack?.dateCreation ?? new Date().toISOString()),
    dateModification: String(pack?.dateModification ?? new Date().toISOString()),
    // Champs backend nouveaux
    ageMinimum: pack?.ageMinimum,
    ageMaximum: pack?.ageMaximum,
    typeClients: pack?.typeClients ?? [],
    ancienneteContratMois: Number(pack?.ancienneteContratMois ?? 0),
    couvertureGeographique: (pack?.couvertureGeographique as any) ?? 'NATIONAL',
    garanties: garantiesRelations,
    // Champs legacy pour compatibilité
    typeProduit: pack?.typeProduit,
    actif: pack?.actif !== false
  };
}

export function normalizePacks(
  packs: Pack[],
  produits: Produit[] = [],
  garanties: Garantie[] = [],
  packGaranties: PackGarantie[] = []
): Pack[] {
  const produitsMap = new Map(
    (produits ?? [])
      .filter((produit) => Boolean(produit.idProduit))
      .map((produit) => [produit.idProduit as string, produit])
  );
  const garantieMap = buildGarantieMap(normalizeGaranties(garanties));
  const packGarantiesByPackId = buildPackGarantieMap(normalizePackGaranties(packGaranties, garantieMap));

  return (packs ?? []).map((pack) => normalizePack(pack, produitsMap, garantieMap, packGarantiesByPackId));
}

export function normalizePackGaranties(
  packGaranties: PackGarantie[],
  garantieMap?: Map<string, Garantie>
): PackGarantie[] {
  return (packGaranties ?? []).map((relation) => normalizePackGarantie(relation, garantieMap));
}

export function normalizeProduit(produit: Partial<Produit> | null | undefined, packs: Pack[] = []): Produit {
  const produitId = String(produit?.idProduit ?? '').trim();
  const relatedPacks = (produit?.packs?.length ? produit.packs : packs).map((pack) => ({
    ...pack,
    produitId: pack.produitId || produitId
  }));
  const prixBaseDerive = relatedPacks.length
    ? Math.min(...relatedPacks.map((pack) => Number(pack.prixMensuel ?? 0)))
    : undefined;

  return {
    idProduit: String(produit?.idProduit ?? ''),
    nomProduit: String(produit?.nomProduit ?? '').trim(),
    description: String(produit?.description ?? '').trim(),
    typeProduit: produit?.typeProduit ?? TypeProduit.SANTE,
    statut: produit?.statut ?? Statut.ACTIF,
    dateCreation: String(produit?.dateCreation ?? new Date().toISOString()),
    dateModification: String(produit?.dateModification ?? new Date().toISOString()),
    // Champs legacy pour compatibilité
    packs: relatedPacks,
    ageMin: Number(produit?.ageMin ?? 0),
    ageMax: Number(produit?.ageMax ?? 0),
    maladieChroniqueAutorisee: Boolean(produit?.maladieChroniqueAutorisee),
    diabetiqueAutorisee: Boolean(produit?.diabetiqueAutorisee),
    actif: produit?.actif !== false,
    prixBase: produit?.prixBase !== undefined
      ? Number(produit.prixBase)
      : prixBaseDerive,
    garanties: produit?.garanties?.map((garantie) => normalizeGarantie(garantie)) ?? [],
    tauxRemboursement: produit?.tauxRemboursement,
  };
}

export function normalizeProduits(produits: Produit[], packs: Pack[] = []): Produit[] {
  const packsByProduit = packs.reduce<Record<string, Pack[]>>((accumulator, pack) => {
    const produitId = String(pack.produitId ?? '').trim();
    if (!produitId) {
      return accumulator;
    }

    accumulator[produitId] = [...(accumulator[produitId] ?? []), pack];
    return accumulator;
  }, {});

  return (produits ?? []).map((produit) =>
    normalizeProduit(produit, packsByProduit[String(produit.idProduit ?? '').trim()] ?? [])
  );
}

export function buildGarantiePayload(garantie: Garantie): Garantie {
  const normalized = normalizeGarantie(garantie);

  return {
    idGarantie: normalized.idGarantie,
    nomGarantie: normalized.nomGarantie,
    description: normalized.description,
    statut: normalized.statut,
    typeMontant: normalized.typeMontant,
    typePlafond: normalized.typePlafond,
    plafondAnnuel: normalized.plafondAnnuel,
    plafondMensuel: normalized.plafondMensuel,
    plafondParActe: normalized.plafondParActe,
    franchise: normalized.franchise,
    coutMoyenParSinistre: normalized.coutMoyenParSinistre,
    dureeMinContrat: normalized.dureeMinContrat,
    dureeMaxContrat: normalized.dureeMaxContrat,
    resiliableAnnuellement: normalized.resiliableAnnuellement,
    creePar: normalized.creePar,
    dateDesactivation: normalized.dateDesactivation,
    tauxRemboursement: normalized.tauxRemboursement,
    dateCreation: normalized.dateCreation,
    dateModification: normalized.dateModification
  };
}

export function buildPackPayload(pack: Pack, includeGaranties = true): Pack {
  const normalized = normalizePack(pack);
  const garantiesPayload = includeGaranties
    ? (normalized.garanties ?? []).map((garantie) => ({
        idPackGarantie: garantie.idPackGarantie,
        packId: garantie.packId,
        idGarantie: garantie.garantieId,
        garantieId: garantie.garantieId,
        tauxRemboursement: Number(garantie.tauxRemboursement ?? 0),
        plafondAnnuel: Number(garantie.plafondAnnuel ?? 0),
        plafondParActe: garantie.plafondParActe || 0,
        delaiCarence: garantie.delaiCarence || 0,
        estOptionnelle: Boolean(garantie.estOptionnelle),
        supplementPrix: Number(garantie.supplementPrix ?? 0),
        tauxCouvertureSpecifique: garantie.tauxCouvertureSpecifique,
        // Champs requis
        nomGarantie: garantie.nomGarantie || '',
        plafond: garantie.plafond || 0,
        franchise: garantie.franchise || 0,
        typeMontant: garantie.typeMontant || 'FRAIS_REELS',
        priorite: garantie.priorite || 1,
        actif: garantie.actif !== false,
        dateActivation: garantie.dateActivation || new Date().toISOString()
      }))
    : [];

  return {
    idPack: normalized.idPack,
    nomPack: normalized.nomPack,
    description: normalized.description,
    produitId: normalized.produitId,
    nomProduit: normalized.nomProduit,
    prixMensuel: normalized.prixMensuel,
    dureeMinContrat: normalized.dureeMinContrat,
    dureeMaxContrat: normalized.dureeMaxContrat,
    niveauCouverture: normalized.niveauCouverture,
    statut: normalized.statut,
    dateCreation: normalized.dateCreation,
    dateModification: normalized.dateModification,
    // Champs backend nouveaux
    ageMinimum: normalized.ageMinimum,
    ageMaximum: normalized.ageMaximum,
    typeClients: normalized.typeClients,
    ancienneteContratMois: normalized.ancienneteContratMois,
    couvertureGeographique: normalized.couvertureGeographique,
    garanties: garantiesPayload
  };
}

export function buildPackGarantiePayload(packGarantie: PackGarantie, forcedPackId?: string): PackGarantie {
  const normalized = normalizePackGarantie({
    ...packGarantie,
    packId: forcedPackId ?? packGarantie.packId
  });
  const packId = forcedPackId ?? normalized.packId;

  return {
    idPackGarantie: normalized.idPackGarantie,
    packId: packId,
    idGarantie: normalized.garantieId,
    garantieId: normalized.garantieId,
    tauxRemboursement: normalized.tauxRemboursement,
    plafondAnnuel: normalized.plafondAnnuel,
    plafondParActe: normalized.plafondParActe,
    delaiCarence: normalized.delaiCarence,
    estOptionnelle: normalized.estOptionnelle,
    supplementPrix: normalized.supplementPrix,
    conditionsSpecifiques: normalized.conditionsSpecifiques,
    // Champs requis
    nomGarantie: normalized.nomGarantie,
    plafond: normalized.plafond,
    franchise: normalized.franchise,
    typeMontant: normalized.typeMontant,
    priorite: normalized.priorite,
    actif: normalized.actif,
    dateActivation: normalized.dateActivation,
    // Champs additionnels
    garantie: normalized.garantie,
    tauxCouvertureSpecifique: normalized.tauxCouvertureSpecifique,
    incluse: normalized.incluse,
    optionnelle: normalized.optionnelle,
    prixAdditionnel: normalized.prixAdditionnel,
    conditionsSpeciales: normalized.conditionsSpeciales,
    dateDesactivation: normalized.dateDesactivation
  };
}

export function buildProduitPayload(produit: Produit): Produit {
  const normalized = normalizeProduit(produit);

  return {
    idProduit: normalized.idProduit,
    nomProduit: normalized.nomProduit,
    description: normalized.description,
    typeProduit: normalized.typeProduit ?? TypeProduit.SANTE,
    statut: normalized.statut ?? Statut.ACTIF,
    dateCreation: normalized.dateCreation,
    dateModification: normalized.dateModification,
    // Champs legacy pour compatibilité
    ageMin: normalized.ageMin,
    ageMax: normalized.ageMax,
    maladieChroniqueAutorisee: normalized.maladieChroniqueAutorisee,
    diabetiqueAutorisee: normalized.diabetiqueAutorisee,
    actif: normalized.actif,
    packs: normalized.packs,
    prixBase: normalized.prixBase,
    garanties: normalized.garanties,
    tauxRemboursement: normalized.tauxRemboursement
  };
}
