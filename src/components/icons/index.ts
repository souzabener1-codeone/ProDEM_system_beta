/**
 * Icon compatibility layer.
 *
 * Re-exports Iconoir icons under the Lucide names used across the codebase,
 * so consumers can `import { Foo } from "@/components/icons"` without
 * changing call sites. Iconoir uses uniform-stroke, straight-corner icons,
 * matching the Flaticon UIcons "Regular Straight" style requested by the
 * user (Iconoir is MIT-licensed).
 */
import type { ComponentType, SVGProps } from "react";
import {
  Activity,
  UserPlus as IconoirAddUser,
  Archive,
  Attachment,
  Bookmark,
  Building,
  ChatBubbleEmpty,
  Check,
  CheckCircle,
  CircleSolid,
  Clock,
  CloudUpload,
  Community,
  DesignPencil,
  DragHandGesture,
  Download,
  EditPencil,
  Eye,
  Filter,
  FloppyDisk,
  Group,
  HealthShield,
  Hashtag,
  Headset,
  HomeSimple,
  Label,
  LogOut,
  Mail,
  Megaphone,
  MediaImage,
  MediaVideo,
  Menu,
  Message,
  MoreHoriz,
  NavArrowDown,
  NavArrowLeft,
  NavArrowRight,
  NavArrowUp,
  Page,
  PageEdit,
  Phone,
  Plus,
  Refresh,
  RefreshDouble,
  Search,
  Send,
  SettingsProfiles,
  StatsReport,
  StatsUpSquare,
  Table,
  TaskList,
  ThumbsUp,
  Trash,
  UserBadgeCheck,
  UserPlus,
  ViewGrid,
  WarningTriangle,
  Xmark,
} from "iconoir-react";

// Generic icon component type (Iconoir signature is compatible with Lucide's
// className/strokeWidth/color/width/height usage in this project).
export type LucideIcon = ComponentType<SVGProps<SVGSVGElement> & { strokeWidth?: number | string }>;

// Navigation / layout
export const LayoutDashboard = ViewGrid;
export const Users = Group;
export const ClipboardList = TaskList;
export const Tags = Bookmark;
export const BarChart3 = StatsReport;
export { Activity, LogOut, Menu };

// Actions
export { Plus, Search, Filter, Download, Trash };
export const X = Xmark;
export const Save = FloppyDisk;
export const Pencil = EditPencil;
export const Edit = EditPencil;
export const Upload = CloudUpload;
export const RefreshCw = Refresh;

// Chevrons
export const ChevronDown = NavArrowDown;
export const ChevronUp = NavArrowUp;
export const ChevronLeft = NavArrowLeft;
export const ChevronRight = NavArrowRight;
export const ChevronDownIcon = NavArrowDown;
export const ChevronUpIcon = NavArrowUp;
export const ChevronLeftIcon = NavArrowLeft;
export const ChevronRightIcon = NavArrowRight;

// Arrows
export { NavArrowLeft as ArrowLeft, NavArrowRight as ArrowRight };

// Status / feedback
export const Loader2 = RefreshDouble;
export const AlertTriangle = WarningTriangle;
export const CircleAlert = WarningTriangle;
export const CheckCircle2 = CheckCircle;
export { Check, Clock, Eye };
export const Circle = CircleSolid;
export const CircleIcon = CircleSolid;
export const Minus = NavArrowDown; // rarely used

// Users / contacts
export { UserPlus, Phone, Mail };
export const UserCheck = UserBadgeCheck;
export const UserCog = SettingsProfiles;
export const Hash = Hashtag;
export const Building2 = Building;

// Categories
export const MessageSquare = ChatBubbleEmpty;
export { Send, Message, Megaphone };
export const Vote = ThumbsUp;
export const ScrollText = Page;
export const Stethoscope = HealthShield;

// Files / attachments
export const FileText = Page;
export const FileSpreadsheet = Table;
export const FileArchive = Archive;
export const FileDown = Download;
export const File = Page;
export const Image = MediaImage;
export const Video = MediaVideo;
export const Headphones = Headset;
export { Attachment, PageEdit, DesignPencil };

// Misc
export const MoreHorizontal = MoreHoriz;
export { MoreHoriz };
export const GripVertical = DragHandGesture;
export const PanelLeft = Menu;
export { Community, StatsUpSquare, HomeSimple, Label, IconoirAddUser as AddUser };
