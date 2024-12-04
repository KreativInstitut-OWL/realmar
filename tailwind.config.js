import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: 'T-StarTW, sans-serif'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			primary: {
  				'50': '#edffe4',
  				'100': '#d6ffc5',
  				'200': '#b0ff92',
  				'300': '#7dff52',
  				'400': '#55fc27',
  				'500': '#2de300',
  				'600': '#1eb600',
  				'700': '#188902',
  				'800': '#176c08',
  				'900': '#175b0c',
  				'950': '#053300',
  				DEFAULT: '#55fc27'
  			},
  			grey: {
  				'50': '#f7f7f7',
  				'100': '#e6e6e6',
  				'200': '#dfdfdf',
  				'300': '#c8c8c8',
  				'400': '#a7a7a7',
  				'500': '#999999',
  				'600': '#888888',
  				'700': '#7b7b7b',
  				'800': '#676767',
  				'900': '#545454',
  				'950': '#363636',
  				DEFAULT: '#e6e6e6'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		}
  	}
  },
  plugins: [animate, typography, containerQueries],
};
