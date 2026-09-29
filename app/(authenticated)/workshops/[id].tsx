import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getEnvironment } from '@/core/config';
import { createHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import {
  createApiWorkshopGateway,
  createWorkshopAttachmentOpener,
  createWorkshopCache,
  loadWorkshopDetails,
} from '@/workshop/data';
import type { WorkshopAttachment, WorkshopDetails } from '@/workshop/domain';
import { WorkshopDetailsScreen } from '@/workshop/presentation';

export default function WorkshopDetailsRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const gateway = useMemo(
    () =>
      createApiWorkshopGateway(
        createHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const attachmentOpener = useMemo(
    () =>
      createWorkshopAttachmentOpener(getEnvironment(), createTokenStorage()),
    [],
  );
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [workshop, setWorkshop] = useState<WorkshopDetails>();
  const [source, setSource] = useState<'network' | 'cache'>('network');
  const [openingAttachmentId, setOpeningAttachmentId] = useState<string>();
  const [attachmentError, setAttachmentError] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const result = await loadDetails(gateway, id);
      setWorkshop(result.data);
      setSource(result.source);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, [gateway, id]);

  const openAttachment = useCallback(
    async (attachment: WorkshopAttachment) => {
      if (!id || openingAttachmentId) return;
      setOpeningAttachmentId(attachment.id);
      setAttachmentError(false);
      try {
        await attachmentOpener.open(id, attachment);
      } catch {
        setAttachmentError(true);
      } finally {
        setOpeningAttachmentId(undefined);
      }
    },
    [attachmentOpener, id, openingAttachmentId],
  );

  useEffect(() => {
    if (!id) return;
    let active = true;
    void loadDetails(gateway, id)
      .then((result) => {
        if (!active) return;
        setWorkshop(result.data);
        setSource(result.source);
        setStatus('success');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [gateway, id]);

  return (
    <WorkshopDetailsScreen
      attachmentError={attachmentError}
      openingAttachmentId={openingAttachmentId}
      onOpenAttachment={openAttachment}
      onRetry={load}
      source={source}
      status={id ? status : 'error'}
      workshop={workshop}
    />
  );
}

async function loadDetails(
  gateway: ReturnType<typeof createApiWorkshopGateway>,
  id: string,
) {
  const userId = await gateway.getCurrentUserId();
  return loadWorkshopDetails({
    id,
    cache: createWorkshopCache({ userId }),
    loadRemote: () => gateway.loadDetails(id),
  });
}
