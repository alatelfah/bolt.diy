import React from 'react';

const EXAMPLE_PROMPTS = [
  { text: 'Create a mobile app about Hero Builder', icon: 'i-ph:mobile' },
  { text: 'Build a todo app in React using Tailwind', icon: 'i-ph:check-square' },
  { text: 'Build a simple blog using Astro', icon: 'i-ph:newspaper' },
  { text: 'Create a cookie consent form using Material UI', icon: 'i-ph:cookie' },
  { text: 'Make a space invaders game', icon: 'i-ph:game-controller' },
  { text: 'Make a Tic Tac Toe game in html, css and js only', icon: 'i-ph:grid-four' },
];

export function ExamplePrompts(sendMessage?: { (event: React.UIEvent, messageInput?: string): void | undefined }) {
  return (
    <div id="examples" className="relative flex flex-col gap-8 w-full max-w-4xl mx-auto flex justify-center">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-bolt-elements-textPrimary mb-2">
          Get Started
        </h2>
        <p className="text-bolt-elements-textSecondary">
          Try one of these examples or start with your own idea
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXAMPLE_PROMPTS.map((examplePrompt, index: number) => {
          return (
            <button
              key={index}
              onClick={(event) => {
                sendMessage?.(event, examplePrompt.text);
              }}
              className="group relative p-6 border border-bolt-elements-borderColor/50 rounded-2xl bg-gradient-to-br from-bolt-elements-bg-depth-2 to-bolt-elements-bg-depth-3 hover:from-accent-50 dark:hover:from-accent-900/20 hover:to-accent-100 dark:hover:to-accent-800/20 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-all duration-300 hover:scale-105 hover:shadow-bolt-elements-shadow-medium hover:border-accent-200/50 dark:hover:border-accent-700/50 text-left"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="w-12 h-12 mb-4 bg-gradient-to-br from-accent-100 to-accent-200 dark:from-accent-800/30 dark:to-accent-900/30 rounded-xl flex items-center justify-center group-hover:from-accent-200 group-hover:to-accent-300 dark:group-hover:from-accent-700/40 dark:group-hover:to-accent-800/40 transition-all duration-300">
                <span className={`${examplePrompt.icon} h-6 w-6 text-accent-600 dark:text-accent-400`} />
              </div>
              
              {/* Text */}
              <div className="font-medium leading-relaxed">
                {examplePrompt.text}
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent-500/5 to-accent-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
