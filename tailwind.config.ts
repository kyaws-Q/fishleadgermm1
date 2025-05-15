import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ["Inter", ...fontFamily.sans],
			},
			colors: {
				// Ocean-inspired color palette
				primary: {
					DEFAULT: "hsl(196, 80%, 45%)",
					foreground: "hsl(0, 0%, 98%)",
					hover: "hsl(196, 80%, 40%)",
				},
				secondary: {
					DEFAULT: "hsl(210, 40%, 96.1%)",
					foreground: "hsl(222.2, 47.4%, 11.2%)",
					hover: "hsl(210, 40%, 90%)",
				},
				accent: {
					DEFAULT: "hsl(180, 70%, 85%)",
					foreground: "hsl(222.2, 47.4%, 11.2%)",
					hover: "hsl(180, 70%, 80%)",
				},
				// Add more ocean-themed colors
				ocean: {
					50: "hsl(196, 80%, 95%)",
					100: "hsl(196, 80%, 90%)",
					200: "hsl(196, 80%, 80%)",
					300: "hsl(196, 80%, 70%)",
					400: "hsl(196, 80%, 60%)",
					500: "hsl(196, 80%, 50%)",
					600: "hsl(196, 80%, 40%)",
					700: "hsl(196, 80%, 30%)",
					800: "hsl(196, 80%, 20%)",
					900: "hsl(196, 80%, 10%)",
				},
				border: "hsl(214.3, 31.8%, 91.4%)",
				input: "hsl(214.3, 31.8%, 91.4%)",
				ring: "hsl(196, 80%, 45%)",
				background: "hsl(0, 0%, 100%)",
				foreground: "hsl(222.2, 84%, 4.9%)",
				card: "hsl(0, 0%, 100%)",
				"card-foreground": "hsl(222.2, 84%, 4.9%)",
				popover: "hsl(0, 0%, 100%)",
				"popover-foreground": "hsl(222.2, 84%, 4.9%)",
				muted: "hsl(210, 40%, 96.1%)",
				"muted-foreground": "hsl(215.4, 16.3%, 46.9%)",
				destructive: "hsl(0, 84.2%, 60.2%)",
				"destructive-foreground": "hsl(210, 40%, 98%)",
			},
			boxShadow: {
				'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.06)',
				'card': '0 8px 30px rgba(0, 0, 0, 0.08)',
				'hover': '0 10px 40px -5px rgba(0, 0, 0, 0.1)',
				'button': '0 2px 10px rgba(0, 0, 0, 0.05)',
				'button-hover': '0 4px 15px rgba(0, 0, 0, 0.1)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'xl': '1rem',
				'2xl': '1.5rem',
			},
			animation: {
				'wave': 'wave 8s ease-in-out infinite',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'float': 'float 6s ease-in-out infinite',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-in',
				'slide-in-up': 'slide-in-up 0.3s ease-out',
				'slide-out-up': 'slide-out-up 0.3s ease-in',
				'slide-in-down': 'slide-in-down 0.3s ease-out',
				'slide-out-down': 'slide-out-down 0.3s ease-in',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'slide-out-left': 'slide-out-left 0.3s ease-in',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-in',
				'zoom-in': 'zoom-in 0.3s ease-out',
				'zoom-out': 'zoom-out 0.3s ease-in',
				'bounce-in': 'bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'bounce-out': 'bounce-out 0.3s cubic-bezier(0.6, -0.28, 0.735, 0.045)',
				'spin-slow': 'spin 3s linear infinite',
				'wiggle': 'wiggle 1s ease-in-out infinite',
				'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite',
			},
			keyframes: {
				wave: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'fade-out': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' },
				},
				'slide-in-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				'slide-out-up': {
					'0%': { transform: 'translateY(0)', opacity: '1' },
					'100%': { transform: 'translateY(-20px)', opacity: '0' },
				},
				'slide-in-down': {
					'0%': { transform: 'translateY(-20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				'slide-out-down': {
					'0%': { transform: 'translateY(0)', opacity: '1' },
					'100%': { transform: 'translateY(20px)', opacity: '0' },
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				'slide-out-left': {
					'0%': { transform: 'translateX(0)', opacity: '1' },
					'100%': { transform: 'translateX(-20px)', opacity: '0' },
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)', opacity: '1' },
					'100%': { transform: 'translateX(20px)', opacity: '0' },
				},
				'zoom-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				'zoom-out': {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'100%': { transform: 'scale(0.95)', opacity: '0' },
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.8)', opacity: '0' },
					'80%': { transform: 'scale(1.05)', opacity: '0.8' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				'bounce-out': {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'20%': { transform: 'scale(1.05)', opacity: '0.8' },
					'100%': { transform: 'scale(0.8)', opacity: '0' },
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' },
				},
				'heartbeat': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.1)' },
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
			},
			transitionProperty: {
				'height': 'height',
				'spacing': 'margin, padding',
				'width': 'width',
				'transform': 'transform',
			},
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
