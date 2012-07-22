<?php

namespace JDA\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class UserController extends Controller
{
    
    public function indexAction($id)
    {
    
   
    	$locale=$this->get('session')->getLocale();
    	$user = $this->get('security.context')->getToken()->getUser();
    	    	if(is_object($user)){
    		$displayName = $user->getDisplayName();
    		$userId = $user->getId();
    	}
    	else{
    		$displayName='none';
    		$userId=-1;	
    	}
    	
    	if($id==0){
			if($userId!=-1) return $this->redirect($this->generateUrl('user',array('locale'=>$locale,'id'=>$userId)), 301);
			else  return $this->redirect($this->generateUrl('home'), 301);
    	}
    	
    	
    	

    	return $this->render('JDACoreBundle:User:user.html.twig', array(
				
					'page'=> 'user',
					'displayname'=>$displayName,
					'filterId'=>$id,
					'userId'=>$userId
					
					
				));
    }
}
