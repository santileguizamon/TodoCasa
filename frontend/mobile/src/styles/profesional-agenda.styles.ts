import { StyleSheet } from 'react-native'

export const profesionalAgendaStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4EFFF',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4EFFF',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  headerBlock: {
    paddingTop: 42,
    paddingBottom: 12,
  },
  heroCard: {
    backgroundColor: '#E2D4FF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#D1BCFB',
  },
  heroKicker: {
    color: '#4C2D87',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    marginTop: 4,
    color: '#2A125E',
    fontSize: 22,
    fontWeight: '800',
  },
  heroSubtitle: {
    marginTop: 4,
    color: '#5B3D98',
    fontSize: 14,
  },
  calendarCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9E1F7',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  monthArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    color: '#2A125E',
    fontSize: 16,
    fontWeight: '800',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    color: '#6B4BAA',
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellOutside: {
    opacity: 0.45,
  },
  dayCellSelected: {
    backgroundColor: '#E9D5FF',
  },
  dayNumber: {
    color: '#2A125E',
    fontSize: 13,
    fontWeight: '700',
  },
  dayNumberOutside: {
    color: '#A78BFA',
  },
  dayNumberSelected: {
    color: '#5B21B6',
  },
  dayNumberToday: {
    color: '#7C3AED',
  },
  dotWrap: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#7C3AED',
  },
  dotCount: {
    fontSize: 10,
    color: '#6D28D9',
    fontWeight: '700',
  },
  dayBlock: {
    marginTop: 14,
    gap: 10,
  },
  dayTitle: {
    color: '#3B0764',
    fontSize: 15,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#F7F3FE',
    borderWidth: 1,
    borderColor: '#E9E1F7',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    color: '#2A125E',
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#E9D5FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#6D28D9',
    fontSize: 12,
    fontWeight: '700',
  },
  cardMeta: {
    marginTop: 7,
    color: '#6B4BAA',
    fontSize: 13,
  },
  emptyCard: {
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: '#2A125E',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B4BAA',
    fontSize: 13,
  },
})
