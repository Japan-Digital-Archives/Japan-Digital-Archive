<?php

namespace JDA\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class ItemController extends Controller
{
    
    public function indexAction($id=NULL)
    {
    
    
    	
    
    	$locale=$this->get('session')->getLocale();
    	$request = $this->getRequest();
	 	$query=$request->query->get('query');
    	
    	$user = $this->get('security.context')->getToken()->getUser();
    	if(is_object($user))$displayName = $user->getDisplayName();
    	else $displayName='none';
    	//return new Response($query);
    	return $this->render('JDACoreBundle:Item:item.html.twig', array(
					// last displayname entered by the user
					'page'=> 'item',
					'displayname'=>$displayName
					
				));
    }
}
