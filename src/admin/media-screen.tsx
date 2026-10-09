import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  AdminPage,
  Card,
  DangerButton,
  Heading,
  LinkButton,
  Notice,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
} from './admin-ui';
import { formatSize, type WorkshopFile } from './media';
import { colors, radii, sizes, spacing, typography } from '@/shared/theme';
import { useWorkshopImageSource } from '@/workshop/presentation/use-workshop-image-source';

type Pending =
  { kind: 'image' } | { kind: 'attachment'; file: WorkshopFile } | undefined;

export function MediaScreen({
  attachments,
  busy,
  feedback,
  imageUrl,
  onAddAttachment,
  onChooseImage,
  onDeleteAttachment,
  onRemoveImage,
  title,
}: Readonly<{
  attachments: readonly WorkshopFile[];
  busy: boolean;
  feedback?: { tone: 'danger' | 'success'; message: string };
  /** Content URL of the current image, when the workshop has one. */
  imageUrl?: string;
  onAddAttachment(): void;
  onChooseImage(): void;
  onDeleteAttachment(file: WorkshopFile): void;
  onRemoveImage(): void;
  title: string;
}>) {
  const [pending, setPending] = useState<Pending>();
  const { refreshImage, source } = useWorkshopImageSource(imageUrl);

  return (
    <AdminPage fallback="/admin/workshops" title="Imagem e anexos">
      <Heading
        title={title}
        subtitle="A imagem aparece na lista e nos detalhes do workshop. Anexos ficam disponíveis para os participantes."
      />
      {feedback ? (
        <Notice tone={feedback.tone}>{feedback.message}</Notice>
      ) : null}

      <Card>
        <SectionTitle>Imagem de capa</SectionTitle>
        {imageUrl ? (
          <Image
            accessibilityLabel="Imagem de capa atual"
            contentFit="cover"
            onError={refreshImage}
            source={source}
            style={styles.preview}
          />
        ) : (
          <Text style={styles.empty}>
            Sem imagem. Os participantes veem uma capa gerada pelo tema até você
            enviar uma foto.
          </Text>
        )}
        <Text style={styles.hint}>JPEG, PNG ou WebP, até 10 MB.</Text>
        <PrimaryButton
          busy={busy}
          label={imageUrl ? 'Trocar imagem' : 'Escolher imagem'}
          onPress={onChooseImage}
        />
        {imageUrl ? (
          pending?.kind === 'image' ? (
            <View style={styles.confirm}>
              <Notice tone="danger">
                Remover a imagem de capa? Os participantes voltam a ver a capa
                gerada pelo tema.
              </Notice>
              <DangerButton
                busy={busy}
                label="Confirmar remoção"
                onPress={() => {
                  setPending(undefined);
                  onRemoveImage();
                }}
              />
              <LinkButton
                label="Manter imagem"
                onPress={() => setPending(undefined)}
              />
            </View>
          ) : (
            <SecondaryButton
              disabled={busy}
              label="Remover imagem"
              onPress={() => setPending({ kind: 'image' })}
            />
          )
        ) : null}
      </Card>

      <Card>
        <SectionTitle>{`Anexos (${attachments.length})`}</SectionTitle>
        {attachments.length === 0 ? (
          <Text style={styles.empty}>Nenhum anexo enviado.</Text>
        ) : (
          attachments.map((file) => (
            <View key={file.id} style={styles.file}>
              <View style={styles.fileText}>
                <Text numberOfLines={1} style={styles.fileName}>
                  {file.filename}
                </Text>
                <Text style={styles.hint}>{formatSize(file.sizeBytes)}</Text>
              </View>
              <View style={styles.fileAction}>
                <SecondaryButton
                  disabled={busy}
                  label="Excluir"
                  onPress={() => setPending({ kind: 'attachment', file })}
                />
              </View>
            </View>
          ))
        )}
        {pending?.kind === 'attachment' ? (
          <View style={styles.confirm}>
            <Notice tone="danger">
              {`Excluir "${pending.file.filename}"? Os participantes deixam de ter acesso a ele.`}
            </Notice>
            <DangerButton
              busy={busy}
              label="Confirmar exclusão"
              onPress={() => {
                const file = pending.file;
                setPending(undefined);
                onDeleteAttachment(file);
              }}
            />
            <LinkButton
              label="Manter anexo"
              onPress={() => setPending(undefined)}
            />
          </View>
        ) : null}
        <Text style={styles.hint}>JPEG, PNG ou WebP, até 10 MB cada.</Text>
        <SecondaryButton
          busy={busy}
          label="Adicionar anexo"
          onPress={onAddAttachment}
        />
      </Card>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  preview: {
    backgroundColor: colors.surface2,
    borderRadius: radii.xl,
    height: 180,
    width: '100%',
  },
  empty: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  hint: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.caption,
  },
  confirm: { gap: spacing.xs },
  file: {
    alignItems: 'center',
    borderTopColor: colors.surface3,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  fileText: { flex: 1 },
  fileName: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.body,
    fontWeight: typography.medium,
  },
  fileAction: { minWidth: sizes.touchTarget * 2 },
});
