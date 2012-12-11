<?php

namespace JDA\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class SeedSubmitController extends Controller
{
    
    public function indexAction()
    {
        $user = $this->get('security.context')->getToken()->getUser();
        if(is_object($user)){
    		$displayName = $user->getDisplayName();
    		$userId = $user->getId();
    	}
    	else{
    		$displayName='none';
    		$userId=0;	
    	}
    
		return $this->render('JDACoreBundle:Forms:seedSubmit.html.twig', array(
					'page'=> 'Seed Submission Form',
                    'displayname'=>$displayName,
                    'userId'=>$userId
				));
    }
    
    public function testimonialAction()
    {
        $user = $this->get('security.context')->getToken()->getUser();
        if(is_object($user)){
    		$displayName = $user->getDisplayName();
    		$userId = $user->getId();
    	}
    	else{
    		$displayName='none';
    		$userId=0;	
    	}
		return $this->render('JDACoreBundle:Forms:testimonial.html.twig', array(
                    'page'=> 'Testimonial Submission Form',
                    'displayname'=>$displayName,
                    'userId'=>$userId
        ));
    }
}

?>