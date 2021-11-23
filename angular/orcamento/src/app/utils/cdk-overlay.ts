import { ConnectedPosition } from '@angular/cdk/overlay';

export interface OverlayPositions {
  top: ConnectedPosition;
  right: ConnectedPosition;
  bottom: ConnectedPosition;
  left: ConnectedPosition;
}

export const overlayPositions: OverlayPositions = {
  top: {
    originX: 'center',
    originY: 'top',
    overlayX: 'center',
    overlayY: 'bottom',
  },
  right: {
    originX: 'end',
    originY: 'center',
    overlayX: 'start',
    overlayY: 'center',
  },
  bottom: {
    originX: 'center',
    originY: 'bottom',
    overlayX: 'center',
    overlayY: 'top',
  },
  left: {
    originX: 'start',
    originY: 'center',
    overlayX: 'end',
    overlayY: 'center',
  },
};

export const getOverlayFromPosition = (
  position: keyof OverlayPositions
): ConnectedPosition[] => {
  switch (position) {
    case 'top': {
      return [
        overlayPositions.top,
        overlayPositions.right,
        overlayPositions.bottom,
        overlayPositions.left,
      ];
    }
    case 'right':
      return [
        overlayPositions.right,
        overlayPositions.bottom,
        overlayPositions.left,
        overlayPositions.top,
      ];
    case 'left':
      return [
        overlayPositions.left,
        overlayPositions.top,
        overlayPositions.right,
        overlayPositions.bottom,
      ];
    default:
      return [
        overlayPositions.bottom,
        overlayPositions.left,
        overlayPositions.top,
        overlayPositions.right,
      ];
  }
};
