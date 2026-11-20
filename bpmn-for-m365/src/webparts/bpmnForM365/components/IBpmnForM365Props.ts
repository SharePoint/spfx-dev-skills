import type { BpmnService } from '../services/BpmnService';

export interface IBpmnForM365Props {
  service: BpmnService;
  fileUrl: string;
  // True when the file comes from the ?file= URL parameter (full-page viewer).
  fullPage: boolean;
  isDarkTheme: boolean;
  backgroundColor: string;
  textColor: string;
}
