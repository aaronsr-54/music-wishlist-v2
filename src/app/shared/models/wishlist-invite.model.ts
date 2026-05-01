export interface WishlistInvite {
  id?: string;
  wishlistOwnerId: string;
  wishlistOwnerName: string;
  invitedEmail: string;
  invitedUid?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
}
