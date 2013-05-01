<?php

namespace JDA\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Doctrine\ORM\Mapping as ORM;

class BatchTagController extends Controller
{

    public function indexAction()
    {
		$tag;
        $form = $this->createFormBuilder()
            ->add('username', 'text')
            ->add('tag', 'text')
            ->getForm();

        return $this->render('JDACoreBundle:BatchTag:batchtag.html.twig', array(
            'form' => $form->createView(),
        ));
    }
    
	/*
    public function indexAction($id)
    {
   
    	$locale=$this->getRequest()->getLocale();
    	$user = $this->get('security.context')->getToken()->getUser();
    	    	if(is_object($user)){
    		$displayName = $user->getDisplayName();
			$userName = $user->getUsername();
    		$userId = $user->getId();
    	}
    	else{
    		$displayName='none';
    		$userId=0;	
    	}
    	
    	if($id==0){
			if($userId!=0) return $this->redirect($this->generateUrl('user',array('locale'=>$locale,'id'=>$userId)), 301);
			else  return $this->redirect($this->generateUrl('home'), 301);
    	}
    	
        $em = $this->getDoctrine()->getEntityManager();
        $q = $em->createQuery("select i from ZeegaDataBundle:Item i where i.media_creator_username = '" . $userName . "'");
        $items = $q->getResult();

    	return $this->render('JDACoreBundle:BatchTag:batchtag.html.twig', array(
				
					'page'=> 'batchtag',
					'displayname'=>$displayName,
					'username'=>$userName,
					'userid'=>$userId,
					'items'=>$items
					
					
				));
    }
	*/
	public function updateAction()
	{
		// $_POST parameters
		$request = $this->getRequest();
		$userid = $request->request->get('userid');
		$tag = $request->request->get('tag');
		
		$db_tag = new \Zeega\DataBundle\Entity\Tag();
		$db_tag->setName($tag);
		$db_tags = new \Zeega\DataBundle\Entity\ItemTags();
		$db_tags->setTag($db_tag);
		
		$em = $this->getDoctrine()->getEntityManager();
        $q = $em->createQuery("select i from ZeegaDataBundle:Item i where i.user_id = " . $userid);
        $items = $q->getResult();
		$results = array();
		foreach ($items as $item) {
			$item->addItemTags($db_tags);
		}
		
        return $this->render('JDACoreBundle:BatchTag:ok.html.twig', array(
			'tag' => $tag,
			'userid' => $userid,
			'items' => $items
        ));
		
    }
}
