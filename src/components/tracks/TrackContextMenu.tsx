'use client';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useTrackContextMenu } from '@/hooks';
import type { ITrack } from '@/interfaces/track.interface';
import { ChevronLeft, Disc, ListPlus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export interface ITrackContextMenuProps {
  track: ITrack;
  x: number;
  y: number;
  onClose: () => void;
  onEdit: () => void;
}

export const TrackContextMenu = (props: ITrackContextMenuProps) => {
  const { track, onClose, onEdit } = props;

  const {
    ref,
    showGroups,
    showAlbums,
    showDelete,
    menuStyle,
    isAdmin,
    groups,
    albums,
    setShowGroups,
    setShowAlbums,
    setShowDelete,
    handleRemoveTrackFromGroup,
    isDeleting,
    handleDeleteTrack,
    handleAddTrackToAlbum,
    handleAddTrackToGroup,
  } = useTrackContextMenu(props);

  return (
    <>
      <div
        ref={ref}
        style={menuStyle}
        className="fixed z-30 w-52 rounded-lg border border-border bg-bg-elevated py-1 shadow-xl animate-fade-slide-in"
      >
        {!showGroups && !showAlbums && (
          <>
            {isAdmin && (
              <>
                <MenuItem
                  icon={Pencil}
                  label="Edit"
                  onClick={onEdit}
                />
                <MenuItem
                  icon={Trash2}
                  label="Delete"
                  danger
                  onClick={() => setShowDelete(true)}
                />
              </>
            )}
            <MenuItem
              icon={Disc}
              label={track.album ? 'Move to album' : 'Add to album'}
              onClick={() => setShowAlbums(true)}
            />
            <MenuItem
              icon={ListPlus}
              label="Add to group"
              onClick={() => setShowGroups(true)}
            />
          </>
        )}

        {showGroups && (
          <div className="max-h-48 overflow-y-auto">
            <button
              onClick={() => setShowGroups(false)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-caption text-text-muted transition-colors hover:bg-bg-highlight hover:text-text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            {(groups ?? []).length === 0 && (
              <p className="px-3 py-2 text-caption text-text-muted">
                No groups yet
              </p>
            )}
            {(groups ?? []).map(group => (
              <AddToGroupItem
                key={group._id}
                groupId={group._id}
                name={group.name}
                trackId={track._id}
                handleAddTrackToGroup={handleAddTrackToGroup}
              />
            ))}
          </div>
        )}

        {showAlbums && (
          <div className="max-h-48 overflow-y-auto">
            <button
              onClick={() => setShowAlbums(false)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-caption text-text-muted transition-colors hover:bg-bg-highlight hover:text-text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            {track.album && (
              <button
                onClick={() => handleRemoveTrackFromGroup(track)}
                className="flex w-full items-center px-3 py-2 text-left text-caption text-danger transition-colors hover:bg-bg-highlight"
              >
                Remove from current album
              </button>
            )}
            {(albums ?? []).length === 0 && (
              <p className="px-3 py-2 text-caption text-text-muted">
                No albums yet
              </p>
            )}
            {(albums ?? []).map((album: { _id: string; title: string }) => (
              <AddToAlbumItem
                key={album._id}
                albumId={album._id}
                title={album.title}
                trackId={track._id}
                currentAlbumId={track.album}
                onDone={onClose}
                handleAddTrackToAlbum={handleAddTrackToAlbum}
                handleRemoveTrackFromGroup={handleRemoveTrackFromGroup}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete track"
        description={`"${track.title}" will be permanently removed from your library.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        onConfirm={() => handleDeleteTrack(track)}
      />
    </>
  );
};

interface IMenuItemProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function MenuItem(props: IMenuItemProps) {
  const { icon: Icon, label, onClick, danger } = props;
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-caption transition-colors hover:bg-bg-highlight ${
        danger ? 'text-danger' : 'text-text-primary'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

interface IAddToGroupItemProps {
  groupId: string;
  name: string;
  trackId: string;
  handleAddTrackToGroup: (groupId: string, trackId: string) => void;
}

const AddToGroupItem = (props: IAddToGroupItemProps) => {
  const { groupId, name, trackId, handleAddTrackToGroup } = props;
  return (
    <button
      onClick={() => handleAddTrackToGroup(groupId, trackId)}
      className="flex w-full items-center px-3 py-2 text-left text-caption text-text-primary transition-colors hover:bg-bg-highlight"
    >
      {name}
    </button>
  );
};

interface IAddToAlbumItemProps {
  albumId: string;
  title: string;
  trackId: string;
  currentAlbumId?: string;
  onDone: () => void;
  handleAddTrackToAlbum: (albumId: string, trackId: string) => void;
  handleRemoveTrackFromGroup: (track: ITrack) => void;
}

const AddToAlbumItem = (props: IAddToAlbumItemProps) => {
  const {
    albumId,
    title,
    trackId,
    currentAlbumId,
    onDone,
    handleRemoveTrackFromGroup,
    handleAddTrackToAlbum,
  } = props;
  const isCurrent = currentAlbumId === albumId;
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (isCurrent || isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      // If track already in another album, remove it first
      if (currentAlbumId && currentAlbumId !== albumId) {
        const track = {
          albumId: currentAlbumId,
          trackId: trackId,
        };
        await handleRemoveTrackFromGroup(track as unknown as ITrack);
      }
      await handleAddTrackToAlbum(albumId, trackId);
      toast.success(`Moved to ${title}`);
      onDone();
    } catch {
      toast.error("Couldn't move track to album");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAdd}
      disabled={isCurrent || isLoading}
      className={`flex w-full items-center px-3 py-2 text-left text-caption transition-colors hover:bg-bg-highlight ${
        isCurrent ? 'text-text-muted' : 'text-text-primary'
      }`}
    >
      {isCurrent ? `${title} (current)` : title}
    </button>
  );
};
