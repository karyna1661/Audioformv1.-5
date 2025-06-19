/**
 * Consistent color theme for the entire application
 */

export const theme = {
  primary: {
    from: "from-indigo-500",
    to: "to-purple-600",
    hover: {
      from: "hover:from-indigo-600",
      to: "hover:to-purple-700",
    },
    gradient: "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700",
    text: "text-indigo-600",
    border: "border-indigo-200",
    bg: "bg-indigo-50",
    light: "bg-indigo-100",
  },
  secondary: {
    gradient: "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700",
    text: "text-purple-600",
    border: "border-purple-200",
    bg: "bg-purple-50",
    light: "bg-purple-100",
  },
  success: {
    text: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    light: "bg-green-100",
  },
  warning: {
    text: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    light: "bg-yellow-100",
  },
  error: {
    text: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    light: "bg-red-100",
  },
  neutral: {
    text: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    light: "bg-gray-100",
  },
} as const

export const buttonVariants = {
  primary: `${theme.primary.gradient} text-white shadow-lg hover:shadow-xl transition-all duration-200`,
  secondary: `${theme.secondary.gradient} text-white shadow-lg hover:shadow-xl transition-all duration-200`,
  outline: `border-2 ${theme.primary.border} ${theme.primary.text} ${theme.primary.bg} hover:bg-indigo-100 transition-colors duration-200`,
  ghost: `${theme.primary.text} hover:${theme.primary.bg} transition-colors duration-200`,
} as const
