/**
 * Fonctions utilitaires pour les transformations Yup
 * Permettent de factoriser la logique de transformation des valeurs vides en null
 */

/**
 * Transforme une chaîne vide en null, sinon retourne la valeur
 */
export const emptyStringToNull = (value: any): any => value === "" ? null : value;

/**
 * Transforme un nombre NaN en null, sinon retourne la valeur
 */
export const emptyNumberToNull = (value: any): any => isNaN(value) ? null : value;

/**
 * Transforme un objet avec tous les champs vides en null
 * Si au moins un champ a du contenu, retourne l'objet
 */
export const emptyObjectToNull = (value: any): any => {
    if (value && typeof value === 'object') {
        const hasContent = Object.values(value).some(v => 
            v !== null && v !== undefined && v !== ''
        );
        return hasContent ? value : null;
    }
    return value;
};
