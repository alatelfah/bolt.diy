import React from 'react';
import type { Template } from '~/types/template';
import { STARTER_TEMPLATES } from '~/utils/constants';

interface FrameworkLinkProps {
  template: Template;
}

const FrameworkLink: React.FC<FrameworkLinkProps> = ({ template }) => (
  <a
    href={`/git?url=https://github.com/${template.githubRepo}.git`}
    data-state="closed"
    data-discover="true"
    className="group block"
  >
    <div className="w-16 h-16 bg-gradient-to-br from-bolt-elements-bg-depth-2 to-bolt-elements-bg-depth-3 hover:from-accent-100 dark:hover:from-accent-800/30 hover:to-accent-200 dark:hover:to-accent-900/30 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-bolt-elements-shadow-medium border border-bolt-elements-borderColor/50 hover:border-accent-200/50 dark:hover:border-accent-700/50">
      <span 
        className={`${template.icon} w-8 h-8 text-2xl transition-all duration-300 group-hover:text-accent-600 dark:group-hover:text-accent-400 grayscale group-hover:grayscale-0`}
        title={template.label}
      />
    </div>
  </a>
);

const StarterTemplates: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-2">
          Start from a template
        </h3>
        <p className="text-sm text-bolt-elements-textSecondary">
          Choose your favorite framework to get started quickly
        </p>
      </div>
      
      <div className="flex justify-center">
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4 max-w-md">
          {STARTER_TEMPLATES.map((template, index) => (
            <div key={template.name} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <FrameworkLink template={template} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StarterTemplates;
