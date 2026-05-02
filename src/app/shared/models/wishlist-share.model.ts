export interface WishlistShare {
  id?: string;
  ownerUid: string;
  ownerName: string;
  ownerPhotoURL: string | null;
  recipientEmail: string;
  recipientUid?: string;
  recipientName?: string;
  hidden: boolean;
  sharedAt: number;
}
