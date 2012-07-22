<?php

namespace JDA\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class SearchController extends Controller
{
    
    public function indexAction($query=NULL)
    {
    
    	$locale=$this->get('session')->getLocale();
    	$request = $this->getRequest();
	 	$query=$request->query->get('query');
    	
    	$user = $this->get('security.context')->getToken()->getUser();
    	if(is_object($user)){
    		$displayName = $user->getDisplayName();
    		$userId = $user->getId();
    	}
    	else{
    		$displayName='none';
    		$userId=-1;	
    	}

    	return $this->render('JDACoreBundle:Search:search.html.twig', array(
					// last displayname entered by the user
					'page'=> 'search',
					'query'=>$query,
					'displayname'=>$displayName,
					'userId'=>$userId
					
					
				));
    }
}
