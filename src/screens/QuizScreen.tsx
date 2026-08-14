import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../components/Chip';
import { DropdownField } from '../components/DropdownField';
import { OptionCard } from '../components/OptionCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressBar } from '../components/ProgressBar';
import { fetchQuizOptions, type QuizOptions, type QuizProfile } from '../services/quizApi';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { rf, rh, rw } from '../theme/responsive';
import { serifItalic } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

type QuizStepId =
  | 'selectedSkinType'
  | 'selectedSensitive'
  | 'age'
  | 'selectedGender'
  | 'selectedFaceBodyConcerns'
  | 'selectedLipsEyesConcerns'
  | 'selectedSpecialConditions';

type QuizStepVariant = 'options' | 'dropdown' | 'chips';

type QuizStep = {
  id: QuizStepId;
  title: string;
  subtitle?: string;
  multiSelect: boolean;
  variant: QuizStepVariant;
  options: string[];
  maxSelections?: number;
};

function titleCase(value: string): string {
  return value.replace(/\b\w/g, char => char.toUpperCase());
}

function buildSteps(options: QuizOptions): QuizStep[] {
  const steps: QuizStep[] = [
    {
      id: 'selectedSkinType',
      title: "What's your skin type?",
      subtitle: 'Pick the one that feels most like you.',
      multiSelect: false,
      variant: 'options',
      options: options.skinTypes,
    },
    {
      id: 'selectedSensitive',
      title: 'Is your skin sensitive?',
      subtitle: 'Does it react easily to new products?',
      multiSelect: false,
      variant: 'options',
      options: options.sensitivityOptions,
    },
    {
      id: 'age',
      title: 'Tell us more about you',
      subtitle: "What's your age group?",
      multiSelect: false,
      variant: 'dropdown',
      options: options.ages,
    },
    {
      id: 'selectedGender',
      title: 'Tell us more about you',
      subtitle: 'How do you identify?',
      multiSelect: false,
      variant: 'dropdown',
      options: options.genders,
    },
    {
      id: 'selectedFaceBodyConcerns',
      title: 'Choose your skin concern',
      subtitle: 'Choose up to 2.',
      multiSelect: true,
      variant: 'chips',
      options: options.faceBodyConcerns,
      maxSelections: 2,
    },
    {
      id: 'selectedSpecialConditions',
      title: 'Any special conditions we should know about?',
      subtitle: 'Choose all that apply.',
      multiSelect: true,
      variant: 'chips',
      options: options.specialConditions,
    },
  ];

  if (options.lipsEyesConcerns.length > 0) {
    steps.splice(5, 0, {
      id: 'selectedLipsEyesConcerns',
      title: 'Any concerns for your lips or eyes?',
      subtitle: 'Choose up to 2.',
      multiSelect: true,
      variant: 'chips',
      options: options.lipsEyesConcerns,
      maxSelections: 2,
    });
  }

  return steps;
}

function buildProfile(selections: Record<string, string[]>): QuizProfile {
  const valueFor = (id: QuizStepId) => selections[id] ?? [];

  return {
    age: valueFor('age')[0] ?? '',
    selectedGender: valueFor('selectedGender')[0] ?? '',
    selectedSkinType: valueFor('selectedSkinType')[0] ?? '',
    selectedSensitive: valueFor('selectedSensitive')[0] === 'Yes',
    selectedFaceBodyConcerns: valueFor('selectedFaceBodyConcerns'),
    selectedLipsEyesConcerns: valueFor('selectedLipsEyesConcerns'),
    selectedSpecialConditions: valueFor('selectedSpecialConditions'),
  };
}

export function QuizScreen({ navigation }: Props) {
  const [steps, setSteps] = useState<QuizStep[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchQuizOptions()
      .then(options => {
        if (!cancelled) {
          setSteps(buildSteps(options));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Couldn't load the quiz. Check your connection.</Text>
          <PrimaryButton label="Go back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  if (!steps) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      </SafeAreaView>
    );
  }

  const step = steps[stepIndex];
  const selected = selections[step.id] ?? [];
  const isLastStep = stepIndex === steps.length - 1;

  // Pregnancy/breastfeeding conditions don't apply to male respondents.
  const isMale = (selections.selectedGender?.[0] ?? '').toLowerCase() === 'male';
  const visibleOptions =
    step.id === 'selectedSpecialConditions' && isMale
      ? step.options.filter(option => !/pregnan|breastfeed/i.test(option))
      : step.options;

  const toggleOption = (option: string) => {
    setSelections(prev => {
      const current = prev[step.id] ?? [];

      if (!step.multiSelect) {
        const next = { ...prev, [step.id]: [option] };
        // Drop any pregnancy/breastfeeding condition picked earlier if the
        // respondent now identifies as male.
        if (step.id === 'selectedGender' && option.toLowerCase() === 'male') {
          const conditions = next.selectedSpecialConditions ?? [];
          next.selectedSpecialConditions = conditions.filter(
            condition => !/pregnan|breastfeed/i.test(condition),
          );
        }
        return next;
      }

      if (current.includes(option)) {
        return { ...prev, [step.id]: current.filter(item => item !== option) };
      }

      if (step.maxSelections && current.length >= step.maxSelections) {
        return prev;
      }

      return { ...prev, [step.id]: [...current, option] };
    });
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    } else {
      navigation.goBack();
    }
  };

  const goNext = () => {
    if (isLastStep) {
      navigation.replace('QuizResults', { profile: buildProfile(selections) });
      return;
    }
    setStepIndex(stepIndex + 1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <ProgressBar current={stepIndex + 1} total={steps.length} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{step.title}</Text>
        {step.subtitle && <Text style={styles.subtitle}>{step.subtitle}</Text>}

        {step.variant === 'options' && (
          <View style={styles.options}>
            {visibleOptions.map(option => (
              <OptionCard
                key={option}
                label={titleCase(option)}
                selected={selected.includes(option)}
                onPress={() => toggleOption(option)}
              />
            ))}
          </View>
        )}

        {step.variant === 'dropdown' && (
          <DropdownField
            placeholder={titleCase(step.id === 'age' ? 'Age' : 'Gender')}
            value={selected[0] ?? null}
            options={step.options}
            formatOption={titleCase}
            onSelect={toggleOption}
            open={dropdownOpen}
            onOpen={() => setDropdownOpen(true)}
            onClose={() => setDropdownOpen(false)}
          />
        )}

        {step.variant === 'chips' && (
          <View style={styles.chips}>
            {visibleOptions.map(option => (
              <Chip
                key={option}
                label={titleCase(option)}
                selected={selected.includes(option)}
                onPress={() => toggleOption(option)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={isLastStep ? 'See my matches' : 'Continue'}
          onPress={goNext}
          disabled={selected.length === 0}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rw(24),
    gap: rw(16),
  },
  errorText: {
    fontSize: rf(15),
    color: colors.textMuted,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: rw(24),
    paddingTop: rh(12),
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: rh(12),
  },
  backText: {
    fontSize: rf(15),
    fontWeight: '600',
    color: colors.textMuted,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: rw(24),
    paddingTop: rh(20),
    paddingBottom: rh(24),
  },
  title: {
    ...serifItalic,
    fontSize: rf(24),
    fontWeight: '700',
    color: colors.text,
    marginBottom: rh(6),
  },
  subtitle: {
    fontSize: rf(15),
    color: colors.textMuted,
    marginBottom: rh(24),
  },
  options: {
    marginTop: rh(8),
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rw(10),
    marginTop: rh(8),
  },
  footer: {
    paddingHorizontal: rw(24),
    paddingBottom: rh(16),
    paddingTop: rh(8),
  },
});
