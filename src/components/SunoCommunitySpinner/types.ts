export interface ActivityDetail {
  detailText: string;
  weight: number; // Master weight
}

export interface WheelConfigData {
  activityWheelTitle: string;
  userName: string;
  activitiesString: string;
  activityDetails: Record<string, ActivityDetail>; // Master details & master weights
  showAddEditDetails: boolean;
  numberOfSegmentsOnWheel: number;
  selectedActivitiesForWheel: Record<string, boolean>;
  wheelActivityWeights: Record<string, number>; // Specific weights for wheel segments
  customTitle?: string;
  customLogo?: string | null;
  selectedLogoSize?: string;
  toolBackgroundColor?: string;
  toolAccentColor?: string;
  toolTextColor?: string;
  wheelSegmentBorderColor?: string;
  wheelTextFont?: string;
  selectedSpinSound?: string;
}

export interface SavedWheel {
  id: string;
  name: string;
  data: WheelConfigData;
}

export interface SpinResultState {
    activity: string;
    detail?: string;
    personalizedMessage: string;
    winningSegmentIndex: number;
}
