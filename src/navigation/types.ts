import type { NavigatorScreenParams } from '@react-navigation/native';
import type { QuizProfile } from '../services/quizApi';
import type { Product } from '../types/product';

export type MainTabParamList = {
  Home: undefined;
  Products: { category?: string } | undefined;
  Wishlist: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  ProductDetails: { product: Product };
  Search: undefined;
  Orders: undefined;
  Settings: undefined;
  Quiz: undefined;
  QuizResults: { profile: QuizProfile };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
