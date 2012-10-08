<?php

namespace JDA\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class SeedSubmitController extends Controller
{
    
    public function indexAction()
    {
    
    	$locale=$this->get('session')->getLocale();
		return $this->render('JDACoreBundle:Forms:seedSubmit.html.twig', array(
					'page'=> 'Seed Submission Form',
				));
    }
}

?>