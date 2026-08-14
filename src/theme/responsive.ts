import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';

// This app was designed against a 375x812 reference window (iPhone 11 Pro /
// X-sized). rw/rh/rf take a plain pixel value *as measured on that
// reference* and convert it to the equivalent percentage argument
// react-native-responsive-dimensions expects, so on the reference device
// rw(16) === 16 exactly, and on any other device it scales proportionally
// to the real window size instead of staying fixed.
const REFERENCE_WIDTH = 375;
const REFERENCE_HEIGHT = 812;
const REFERENCE_FONT_DIAGONAL = Math.sqrt(
  ((16 / 9) * REFERENCE_WIDTH) ** 2 + REFERENCE_WIDTH ** 2,
);

export function rw(px: number): number {
  return responsiveWidth((px / REFERENCE_WIDTH) * 100);
}

export function rh(px: number): number {
  return responsiveHeight((px / REFERENCE_HEIGHT) * 100);
}

export function rf(px: number): number {
  return responsiveFontSize((px / REFERENCE_FONT_DIAGONAL) * 100);
}
