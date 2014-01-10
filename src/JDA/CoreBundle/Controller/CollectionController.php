<?php

namespace JDA\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class CollectionController extends Controller
{
    
    public function indexAction($id)
    {
		$em = $this->getDoctrine()->getEntityManager();
		$query = "select i from ZeegaDataBundle:Item i where i.id =".$id;
        $q = $em->createQuery($query);
		$items = $q->getResult();
		$collection = $items[0];
		$authorId = $collection->getUserId();

    	$locale=$this->getRequest()->getLocale();
    	$user = $this->get('security.context')->getToken()->getUser();
    	if(is_object($user)){
    		$displayName = $user->getDisplayName();
    		$userId = $user->getId();
    	}
    	else{
    		$displayName='none';
    		$userId=0;	
    	}

    	return $this->render('JDACoreBundle:Collection:collection.html.twig', array(
					'page'=> 'collection',
					'displayname'=>$displayName,
					'filterId'=>$id,
					'userId'=>$userId,
					'authorId'=>$authorId,
				));
    }
}
