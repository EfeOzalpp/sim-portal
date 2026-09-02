// Barrel so existing "@/actions/user-image-storage" imports keep resolving
// unchanged. Import store.ts / delete.ts directly instead if you only need
// one — both are tiny/cheap (no heavy dependency behind either), so this
// split is purely for readability, not a compile-cost concern like AntD.tsx.
export { storeUserImage } from "@/actions/user-image-storage/store";
export type { StoredUserImage } from "@/actions/user-image-storage/store";
export { deleteStoredUserImage } from "@/actions/user-image-storage/delete";
