<?php
namespace Zeega\AdminBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController as Controller;

class ItemAdminController extends Controller
{
    public function batchActionPublish(ProxyQueryInterface $selectedModelQuery)
    {
        if ($this->admin->isGranted('EDIT') === false || $this->admin->isGranted('DELETE') === false)
        {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine()->getEntityManager();

        foreach ($query->getQuery()->iterate() as $entity) {
            $entity[0]->setPublished(true);
            $em->persist($entity[0]);
        }
        $em->flush();

        $this->get('session')->setFlash('sonata_flash_success', 'flash_batch_merge_success');

        return new RedirectResponse($this->admin->generateUrl('list', array('filter' => $this->admin->getFilterParameters())));
    }
} 