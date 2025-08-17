import ignore from 'ignore';
import { useGit } from '~/lib/hooks/useGit';
import type { Message } from 'ai';
import { detectProjectCommands, createCommandsMessage, escapeHeroTags } from '~/utils/projectCommands';
import { generateId } from '~/utils/fileUtils';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { LoadingOverlay } from '~/components/ui/LoadingOverlay';
import { RepositorySelectionDialog } from '~/components/@settings/tabs/connections/components/RepositorySelectionDialog';
import { classNames } from '~/utils/classNames';
import { Button } from '~/components/ui/Button';
import type { IChatMetadata } from '~/lib/persistence/db';

const IGNORE_PATTERNS = [
  'node_modules/**',
  '.git/**',
  '.github/**',
  '.vscode/**',
  'dist/**',
  'build/**',
  '.next/**',
  'coverage/**',
  '.cache/**',
  '.idea/**',
  '**/*.log',
  '**/.DS_Store',
  '**/npm-debug.log*',
  '**/yarn-debug.log*',
  '**/yarn-error.log*',

  // Include this so npm install runs much faster '**/*lock.json',
  '**/*lock.yaml',
];

const ig = ignore().add(IGNORE_PATTERNS);

const MAX_FILE_SIZE = 100 * 1024; // 100KB limit per file
const MAX_TOTAL_SIZE = 500 * 1024; // 500KB total limit

interface GitCloneButtonProps {
  className?: string;
  importChat?: (description: string, messages: Message[], metadata?: IChatMetadata) => Promise<void>;
}

export default function GitCloneButton({ importChat, className }: GitCloneButtonProps) {
  const { ready, gitClone } = useGit();
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClone = async (repoUrl: string) => {
    if (!ready) {
      return;
    }

    setLoading(true);

    try {
      const { workdir, data } = await gitClone(repoUrl);

      if (importChat) {
        const filePaths = Object.keys(data).filter((filePath) => !ig.ignores(filePath));
        const textDecoder = new TextDecoder('utf-8');

        let totalSize = 0;
        const skippedFiles: string[] = [];
        const fileContents = [];

        for (const filePath of filePaths) {
          const { data: content, encoding } = data[filePath];

          // Skip binary files
          if (
            content instanceof Uint8Array &&
            !filePath.match(/\.(txt|md|astro|mjs|js|jsx|ts|tsx|json|html|css|scss|less|yml|yaml|xml|svg|vue|svelte)$/i)
          ) {
            skippedFiles.push(filePath);
            continue;
          }

          try {
            const textContent =
              encoding === 'utf8' ? content : content instanceof Uint8Array ? textDecoder.decode(content) : '';

            if (!textContent) {
              continue;
            }

            // Check file size
            const fileSize = new TextEncoder().encode(textContent).length;

            if (fileSize > MAX_FILE_SIZE) {
              skippedFiles.push(`${filePath} (too large: ${Math.round(fileSize / 1024)}KB)`);
              continue;
            }

            // Check total size
            if (totalSize + fileSize > MAX_TOTAL_SIZE) {
              skippedFiles.push(`${filePath} (would exceed total size limit)`);
              continue;
            }

            totalSize += fileSize;
            fileContents.push({ filePath, content: textContent });
          } catch (error) {
            console.error('Error processing file:', filePath, error);
            skippedFiles.push(`${filePath} (error processing)`);
          }
        }

        if (fileContents.length === 0) {
          toast.error('No valid files found in repository');
          return;
        }

        const commandsMessage = createCommandsMessage(fileContents, workdir);
        const description = `Cloned repository: ${repoUrl}`;

        await importChat(description, [commandsMessage]);

        if (skippedFiles.length > 0) {
          toast.warning(
            `Imported ${fileContents.length} files. Skipped ${skippedFiles.length} files due to size or type restrictions.`,
            { autoClose: 5000 }
          );
        } else {
          toast.success(`Successfully imported ${fileContents.length} files from repository`);
        }
      }
    } catch (error) {
      console.error('Error cloning repository:', error);
      toast.error('Failed to clone repository. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        variant="default"
        size="lg"
        className={classNames(
          'gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
          'text-white font-medium',
          'h-12 px-6 py-3 min-w-[140px] justify-center',
          'transition-all duration-300 ease-in-out hover:scale-105',
          'shadow-bolt-elements-shadow-soft hover:shadow-bolt-elements-shadow-medium',
          'rounded-xl',
          className,
        )}
      >
        <span className="i-ph:git-branch w-5 h-5" />
        Clone Repo
      </Button>

      {loading && <LoadingOverlay />}

      <RepositorySelectionDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelect={handleClone}
        title="Clone Repository"
        description="Enter a GitHub repository URL to clone and import into your chat"
      />
    </>
  );
}
